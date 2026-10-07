"""
LCA API Server
API REST per il calcolo LCA usando http.server (nessuna dipendenza esterna)
"""

import json
import sqlite3
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sys
sys.path.insert(0, '/home/indigo/RonaldoRiska')

from lca_engine import LCAEngine, LCAInput, ProductComponent, Transport, create_tshirt_example


class LCAHandler(BaseHTTPRequestHandler):
    """Handler per le richieste HTTP"""
    
    def __init__(self, *args, **kwargs):
        self.engine = LCAEngine()
        super().__init__(*args, **kwargs)
    
    def _send_json(self, data, status=200):
        """Invia risposta JSON"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode())
    
    def _send_error(self, message, status=400):
        """Invia errore JSON"""
        self._send_json({'error': message}, status)
    
    def do_GET(self):
        """Gestisce richieste GET"""
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/api/materials':
            self._get_materials()
        elif path == '/api/processes':
            self._get_processes()
        elif path == '/api/results':
            self._get_results()
        elif path == '/api/health':
            self._send_json({'status': 'ok', 'engine': 'LCAEngine v1.0'})
        else:
            self._send_error('Endpoint non trovato', 404)
    
    def do_POST(self):
        """Gestisce richieste POST"""
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/api/calculate':
            self._post_calculate()
        else:
            self._send_error('Endpoint non trovato', 404)
    
    def do_OPTIONS(self):
        """Gestisce richieste OPTIONS (CORS)"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def _get_materials(self):
        """GET /api/materials - Lista materiali"""
        conn = self.engine._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, category, origin, is_recycled, default_country
            FROM materials ORDER BY name
        """)
        materials = []
        for row in cursor.fetchall():
            materials.append({
                'id': row[0],
                'name': row[1],
                'category': row[2],
                'origin': row[3],
                'is_recycled': row[4],
                'default_country': row[5]
            })
        conn.close()
        self._send_json({'materials': materials, 'count': len(materials)})
    
    def _get_processes(self):
        """GET /api/processes - Lista processi"""
        conn = self.engine._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, category, unit
            FROM processes ORDER BY category, name
        """)
        processes = []
        for row in cursor.fetchall():
            processes.append({
                'id': row[0],
                'name': row[1],
                'category': row[2],
                'unit': row[3]
            })
        conn.close()
        self._send_json({'processes': processes, 'count': len(processes)})
    
    def _get_results(self):
        """GET /api/results - Risultati salvati"""
        results = self.engine.list_results(limit=20)
        self._send_json({'results': results, 'count': len(results)})
    
    def _post_calculate(self):
        """POST /api/calculate - Calcolo LCA"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            # Costruisci LCAInput dalla richiesta
            product_name = data.get('product_name', 'Prodotto senza nome')
            components = []
            
            for comp_data in data.get('components', []):
                material = None
                if comp_data.get('material_id'):
                    material = self.engine.get_material(comp_data['material_id'])
                
                processes = []
                for proc_id in comp_data.get('process_ids', []):
                    proc = self.engine.get_process(proc_id)
                    if proc:
                        processes.append(proc)
                
                transports = []
                for trans_data in comp_data.get('transports', []):
                    transport = Transport(
                        mode=trans_data.get('mode', 'road'),
                        distance_km=trans_data.get('distance_km', 0),
                        mass_kg=trans_data.get('mass_kg', 0),
                        emission_factors=self.engine._get_transport_factor(trans_data.get('mode', 'road'))
                    )
                    transports.append(transport)
                
                component = ProductComponent(
                    name=comp_data.get('name', 'Componente'),
                    material=material,
                    mass_kg=comp_data.get('mass_kg', 0),
                    processes=processes,
                    transports=transports,
                    loss_rate=comp_data.get('loss_rate', 0)
                )
                components.append(component)
            
            lca_input = LCAInput(
                product_name=product_name,
                functional_unit=data.get('functional_unit', '1 product'),
                components=components,
                use_phase_energy_kwh=data.get('use_phase_energy_kwh', 0),
                use_phase_water_kg=data.get('use_phase_water_kg', 0),
                use_phase_detergent_kg=data.get('use_phase_detergent_kg', 0),
                end_of_life_transport_km=data.get('end_of_life_transport_km', 0)
            )
            
            # Calcola
            result = self.engine.calculate(lca_input)
            
            # Salva
            result_id = self.engine.save_result(result)
            
            # Prepara risposta
            response = {
                'id': result_id,
                'product_name': result.product_name,
                'functional_unit': result.functional_unit,
                'total_mass_kg': result.total_mass_kg,
                'impacts': result.impacts,
                'phase_impacts': result.phase_impacts,
                'pef_score': result.pef_score,
                'environmental_cost': result.environmental_cost,
                'data_source': result.data_source,
                'calculation_method': result.calculation_method
            }
            
            self._send_json(response, 201)
            
        except json.JSONDecodeError:
            self._send_error('JSON non valido')
        except Exception as e:
            self._send_error(f'Errore nel calcolo: {str(e)}', 500)


def run_server(port=8766):
    """Avvia il server API"""
    server = HTTPServer(('0.0.0.0', port), LCAHandler)
    print(f"LCA API Server avviato su http://localhost:{port}")
    print("Endpoints:")
    print("  GET  /api/health      - Stato del server")
    print("  GET  /api/materials   - Lista materiali")
    print("  GET  /api/processes   - Lista processi")
    print("  POST /api/calculate   - Calcolo LCA")
    print("  GET  /api/results     - Risultati salvati")
    print("\nPremi Ctrl+C per fermare")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer fermato")
        server.server_close()


if __name__ == '__main__':
    run_server()
