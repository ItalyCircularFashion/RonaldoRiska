"""
LCA Calculation Engine
Modello di calcolo Life Cycle Assessment per prodotti tessili
Basato su dati ADEME Base Impacts (settembre 2025)
"""

import sqlite3
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum
from pathlib import Path


class ImpactCategory(Enum):
    """16 categorie di impatto PEF"""
    CLIMATE_CHANGE = "climate_change"
    ACIDIFICATION = "acidification"
    EUTROPHICATION_FRESHWATER = "eutrophication_freshwater"
    EUTROPHICATION_MARINE = "eutrophication_marine"
    EUTROPHICATION_TERRESTRIAL = "eutrophication_terrestrial"
    HUMAN_TOXICITY_CANCER = "human_toxicity_cancer"
    HUMAN_TOXICITY_NON_CANCER = "human_toxicity_non_cancer"
    FRESHWATER_ECOTOXICITY = "freshwater_ecotoxicity"
    FOSSIL_RESOURCES = "fossil_resources"
    MINERAL_RESOURCES = "mineral_resources"
    WATER_USE = "water_use"
    LAND_USE = "land_use"
    IONIZING_RADIATION = "ionizing_radiation"
    PHOTOCHEMICAL_OZONE = "photochemical_ozone"
    PARTICULATES = "particulates"
    OZONE_DEPLETION = "ozone_depletion"


@dataclass
class Material:
    """Materiale tessile con fattori di emissione"""
    id: str
    name: str
    category: str
    unit: str = "kg"
    origin: str = ""
    is_recycled: str = "non"
    microfiber_complement: float = 0.0
    spinning_process: str = ""
    geographic_origin: str = ""
    default_country: str = ""
    allocation_coefficient: float = 0.0
    quality_ratio: float = 0.0
    # Fattori di emissione per kg di materiale
    emission_factors: Dict[str, float] = field(default_factory=dict)


@dataclass
class Process:
    """Processo di trasformazione con fattori di emissione"""
    id: str
    name: str
    category: str
    unit: str
    electricity: float = 0.0
    heat: float = 0.0
    losses: float = 0.0
    density: float = 0.0
    # Fattori di emissione per unità di processo
    emission_factors: Dict[str, float] = field(default_factory=dict)


@dataclass
class Transport:
    """Trasporto merci"""
    mode: str  # maritime, road, air
    distance_km: float
    mass_kg: float
    # Fattori di emissione per tkm
    emission_factors: Dict[str, float] = field(default_factory=dict)


@dataclass
class ProductComponent:
    """Componente del prodotto (es. tessuto, bottone, cerniera)"""
    name: str
    material: Optional[Material] = None
    mass_kg: float = 0.0
    processes: List[Process] = field(default_factory=list)
    transports: List[Transport] = field(default_factory=list)
    sub_components: List['ProductComponent'] = field(default_factory=list)
    loss_rate: float = 0.0  # Tasso di perdita (es. 0.14 per 14%)


@dataclass
class LCAInput:
    """Input per il calcolo LCA"""
    product_name: str
    functional_unit: str = "1 product"
    components: List[ProductComponent] = field(default_factory=list)
    # Parametri di utilizzo
    use_phase_energy_kwh: float = 0.0
    use_phase_water_kg: float = 0.0
    use_phase_detergent_kg: float = 0.0
    # Parametri di fine vita
    end_of_life_transport_km: float = 0.0
    end_of_life_treatment: str = "incineration_landfill"


@dataclass
class LCAOutput:
    """Output del calcolo LCA"""
    product_name: str
    functional_unit: str
    total_mass_kg: float
    # Risultati per categoria di impatto
    impacts: Dict[str, float] = field(default_factory=dict)
    # Ripartizione per fase
    phase_impacts: Dict[str, Dict[str, float]] = field(default_factory=dict)
    # Score aggregati
    pef_score: float = 0.0
    environmental_cost: float = 0.0
    # Metadati
    data_source: str = "ADEME Base Impacts v3.0 (settembre 2025)"
    calculation_method: str = "PEF 3.0"


class LCAEngine:
    """
    Motore di calcolo LCA per prodotti tessili.
    
    Implementa il metodo PEF (Product Environmental Footprint) con 16 categorie di impatto.
    I fattori di emissione sono basati su ADEME Base Impacts v3.0 (settembre 2025).
    """
    
    def __init__(self, db_path: str = "/home/indigo/RonaldoRiska/lca_data.db"):
        self.db_path = db_path
        self._validate_database()
    
    def _validate_database(self):
        """Verifica che il database esista e contenga le tabelle necessarie"""
        if not Path(self.db_path).exists():
            raise FileNotFoundError(f"Database not found: {self.db_path}")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Verifica tabelle necessarie
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = {row[0] for row in cursor.fetchall()}
        
        required = {'materials', 'processes', 'impact_categories'}
        missing = required - tables
        if missing:
            raise ValueError(f"Missing tables in database: {missing}")
        
        conn.close()
    
    def _get_connection(self):
        """Connessione al database"""
        return sqlite3.connect(self.db_path)
    
    def get_material(self, material_id: str) -> Optional[Material]:
        """Recupera un materiale dal database"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, technical_name, source, category, unit, origin, is_recycled,
                   microfiber_complement, spinning_process, recycling_process, geographic_origin,
                   default_country, allocation_coefficient, quality_ratio
            FROM materials WHERE id = ?
        """, (material_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        # Recupera i fattori di emissione dai processi associati
        emission_factors = self._get_material_emission_factors(material_id)
        
        return Material(
            id=row[0],
            name=row[1],
            category=row[4],
            unit=row[5],
            origin=row[6],
            is_recycled=row[7],
            microfiber_complement=row[8] or 0.0,
            spinning_process=row[9] or "",
            geographic_origin=row[10] or "",
            default_country=row[11] or "",
            allocation_coefficient=row[12] or 0.0,
            quality_ratio=row[13] or 0.0,
            emission_factors=emission_factors
        )
    
    def _get_material_emission_factors(self, material_id: str) -> Dict[str, float]:
        """Recupera i fattori di emissione per un materiale dai processi associati"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Cerca processi che usano questo materiale
        cursor.execute("""
            SELECT acidification, climate_change, eutrophication_freshwater,
                   marine_eutrophication, terrestrial_eutrophication,
                   human_toxicity_cancer, human_toxicity_non_cancer,
                   freshwater_eutrophication, fossil_resources, mineral_resources,
                   water_use, land_use, ionizing_radiation, photochemical_ozone,
                   particulates, ozone_depletion, environmental_cost, pef_score
            FROM processes 
            WHERE name LIKE ? OR technical_name LIKE ?
            LIMIT 1
        """, (f"%{material_id}%", f"%{material_id}%"))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return {}
        
        return {
            'acidification': row[0] or 0.0,
            'climate_change': row[1] or 0.0,
            'eutrophication_freshwater': row[2] or 0.0,
            'eutrophication_marine': row[3] or 0.0,  # DB: marine_eutrophication
            'eutrophication_terrestrial': row[4] or 0.0,  # DB: terrestrial_eutrophication
            'human_toxicity_cancer': row[5] or 0.0,
            'human_toxicity_non_cancer': row[6] or 0.0,
            'freshwater_ecotoxicity': row[7] or 0.0,  # DB: freshwater_eutrophication
            'fossil_resources': row[8] or 0.0,
            'mineral_resources': row[9] or 0.0,
            'water_use': row[10] or 0.0,
            'land_use': row[11] or 0.0,
            'ionizing_radiation': row[12] or 0.0,
            'photochemical_ozone': row[13] or 0.0,
            'particulates': row[14] or 0.0,
            'ozone_depletion': row[15] or 0.0,
            'environmental_cost': row[16] or 0.0,
            'pef_score': row[17] or 0.0,
        }
    
    def get_process(self, process_id: str) -> Optional[Process]:
        """Recupera un processo dal database"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, category, unit, electricity, heat, losses, density,
                   acidification, climate_change, eutrophication_freshwater,
                   marine_eutrophication, terrestrial_eutrophication,
                   human_toxicity_cancer, human_toxicity_non_cancer,
                   freshwater_eutrophication, fossil_resources, mineral_resources,
                   water_use, land_use, ionizing_radiation, photochemical_ozone,
                   particulates, ozone_depletion, environmental_cost, pef_score
            FROM processes WHERE id = ?
        """, (process_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        return Process(
            id=row[0],
            name=row[1],
            category=row[2],
            unit=row[3],
            electricity=row[4] or 0.0,
            heat=row[5] or 0.0,
            losses=row[6] or 0.0,
            density=row[7] or 0.0,
            emission_factors={
                'acidification': row[8] or 0.0,
                'climate_change': row[9] or 0.0,
                'eutrophication_freshwater': row[10] or 0.0,
                'eutrophication_marine': row[11] or 0.0,
                'eutrophication_terrestrial': row[12] or 0.0,
                'human_toxicity_cancer': row[13] or 0.0,
                'human_toxicity_non_cancer': row[14] or 0.0,
                'freshwater_ecotoxicity': row[15] or 0.0,
                'fossil_resources': row[16] or 0.0,
                'mineral_resources': row[17] or 0.0,
                'water_use': row[18] or 0.0,
                'land_use': row[19] or 0.0,
                'ionizing_radiation': row[20] or 0.0,
                'photochemical_ozone': row[21] or 0.0,
                'particulates': row[22] or 0.0,
                'ozone_depletion': row[23] or 0.0,
                'environmental_cost': row[24] or 0.0,
                'pef_score': row[25] or 0.0,
            }
        )
    
    def calculate(self, lca_input: LCAInput) -> LCAOutput:
        """
        Esegue il calcolo LCA completo.
        
        Il calcolo segue la struttura ad albero del prodotto:
        1. Per ogni componente, calcola l'impatto dei materiali
        2. Aggiungi l'impatto dei processi di trasformazione
        3. Aggiungi l'impatto dei trasporti
        4. Applica i tassi di perdita
        5. Aggrega i risultati per fase del ciclo vitale
        """
        impacts = {cat.value: 0.0 for cat in ImpactCategory}
        phase_impacts = {
            'material': {cat.value: 0.0 for cat in ImpactCategory},
            'production': {cat.value: 0.0 for cat in ImpactCategory},
            'distribution': {cat.value: 0.0 for cat in ImpactCategory},
            'use': {cat.value: 0.0 for cat in ImpactCategory},
            'end_of_life': {cat.value: 0.0 for cat in ImpactCategory},
        }
        
        total_mass = 0.0
        
        for component in lca_input.components:
            component_mass = component.mass_kg
            total_mass += component_mass
            
            # Calcola impatto materiali
            if component.material and component.material.emission_factors:
                for cat in ImpactCategory:
                    factor = component.material.emission_factors.get(cat.value, 0.0)
                    impact = factor * component_mass
                    impacts[cat.value] += impact
                    phase_impacts['material'][cat.value] += impact
            
            # Calcola impatto processi
            for process in component.processes:
                # Applica tasso di perdita
                effective_mass = component_mass * (1 + component.loss_rate)
                
                for cat in ImpactCategory:
                    factor = process.emission_factors.get(cat.value, 0.0)
                    impact = factor * effective_mass
                    impacts[cat.value] += impact
                    phase_impacts['production'][cat.value] += impact
            
            # Calcola impatto trasporti
            for transport in component.transports:
                tkm = transport.distance_km * transport.mass_kg
                for cat in ImpactCategory:
                    factor = transport.emission_factors.get(cat.value, 0.0)
                    impact = factor * tkm
                    impacts[cat.value] += impact
                    phase_impacts['distribution'][cat.value] += impact
        
        # Fase di utilizzo
        if lca_input.use_phase_energy_kwh > 0:
            # Usa mix elettrico FR come default
            elec_factor = self._get_electricity_factor('FR')
            for cat in ImpactCategory:
                factor = elec_factor.get(cat.value, 0.0)
                impact = factor * lca_input.use_phase_energy_kwh
                impacts[cat.value] += impact
                phase_impacts['use'][cat.value] += impact
        
        # Fine vita
        if lca_input.end_of_life_transport_km > 0:
            # Trasporto stradale
            road_factor = self._get_transport_factor('road')
            tkm = lca_input.end_of_life_transport_km * total_mass
            for cat in ImpactCategory:
                factor = road_factor.get(cat.value, 0.0)
                impact = factor * tkm
                impacts[cat.value] += impact
                phase_impacts['end_of_life'][cat.value] += impact
        
        # Calcola score aggregati
        pef_score = sum(impacts.values())
        environmental_cost = impacts.get('environmental_cost', 0.0)
        
        return LCAOutput(
            product_name=lca_input.product_name,
            functional_unit=lca_input.functional_unit,
            total_mass_kg=total_mass,
            impacts=impacts,
            phase_impacts=phase_impacts,
            pef_score=pef_score,
            environmental_cost=environmental_cost,
        )
    
    def _get_electricity_factor(self, country: str) -> Dict[str, float]:
        """Recupera i fattori di emissione per il mix elettrico di un paese"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT acidification, climate_change, eutrophication_freshwater,
                   marine_eutrophication, terrestrial_eutrophication,
                   human_toxicity_cancer, human_toxicity_non_cancer,
                   freshwater_eutrophication, fossil_resources, mineral_resources,
                   water_use, land_use, ionizing_radiation, photochemical_ozone,
                   particulates, ozone_depletion, environmental_cost, pef_score
            FROM processes 
            WHERE name LIKE ? AND category = 'Énergie'
            LIMIT 1
        """, (f"%{country}%",))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return {}
        
        return {
            'acidification': row[0] or 0.0,
            'climate_change': row[1] or 0.0,
            'eutrophication_freshwater': row[2] or 0.0,
            'eutrophication_marine': row[3] or 0.0,  # DB: marine_eutrophication
            'eutrophication_terrestrial': row[4] or 0.0,  # DB: terrestrial_eutrophication
            'human_toxicity_cancer': row[5] or 0.0,
            'human_toxicity_non_cancer': row[6] or 0.0,
            'freshwater_ecotoxicity': row[7] or 0.0,  # DB: freshwater_eutrophication
            'fossil_resources': row[8] or 0.0,
            'mineral_resources': row[9] or 0.0,
            'water_use': row[10] or 0.0,
            'land_use': row[11] or 0.0,
            'ionizing_radiation': row[12] or 0.0,
            'photochemical_ozone': row[13] or 0.0,
            'particulates': row[14] or 0.0,
            'ozone_depletion': row[15] or 0.0,
            'environmental_cost': row[16] or 0.0,
            'pef_score': row[17] or 0.0,
        }
    
    def _get_transport_factor(self, mode: str) -> Dict[str, float]:
        """Recupera i fattori di emissione per un modalità di trasporto"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT acidification, climate_change, eutrophication_freshwater,
                   marine_eutrophication, terrestrial_eutrophication,
                   human_toxicity_cancer, human_toxicity_non_cancer,
                   freshwater_eutrophication, fossil_resources, mineral_resources,
                   water_use, land_use, ionizing_radiation, photochemical_ozone,
                   particulates, ozone_depletion, environmental_cost, pef_score
            FROM processes 
            WHERE name LIKE ? AND category = 'Transport'
            LIMIT 1
        """, (f"%{mode}%",))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return {}
        
        return {
            'acidification': row[0] or 0.0,
            'climate_change': row[1] or 0.0,
            'eutrophication_freshwater': row[2] or 0.0,
            'eutrophication_marine': row[3] or 0.0,  # DB: marine_eutrophication
            'eutrophication_terrestrial': row[4] or 0.0,  # DB: terrestrial_eutrophication
            'human_toxicity_cancer': row[5] or 0.0,
            'human_toxicity_non_cancer': row[6] or 0.0,
            'freshwater_ecotoxicity': row[7] or 0.0,  # DB: freshwater_eutrophication
            'fossil_resources': row[8] or 0.0,
            'mineral_resources': row[9] or 0.0,
            'water_use': row[10] or 0.0,
            'land_use': row[11] or 0.0,
            'ionizing_radiation': row[12] or 0.0,
            'photochemical_ozone': row[13] or 0.0,
            'particulates': row[14] or 0.0,
            'ozone_depletion': row[15] or 0.0,
            'environmental_cost': row[16] or 0.0,
            'pef_score': row[17] or 0.0,
        }
    
    def save_result(self, result: LCAOutput) -> int:
        """Salva il risultato del calcolo nel database"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO product_lca (
                product_name, total_mass,
                climate_change, acidification, eutrophication_freshwater,
                eutrophication_marine, eutrophication_terrestrial,
                human_toxicity_cancer, human_toxicity_non_cancer,
                freshwater_ecotoxicity, fossil_resources, mineral_resources,
                water_use, land_use, ionizing_radiation, photochemical_ozone,
                particulates, ozone_depletion, environmental_cost, pef_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result.product_name, result.total_mass_kg,
            result.impacts.get('climate_change', 0.0),
            result.impacts.get('acidification', 0.0),
            result.impacts.get('eutrophication_freshwater', 0.0),
            result.impacts.get('eutrophication_marine', 0.0),
            result.impacts.get('eutrophication_terrestrial', 0.0),
            result.impacts.get('human_toxicity_cancer', 0.0),
            result.impacts.get('human_toxicity_non_cancer', 0.0),
            result.impacts.get('freshwater_ecotoxicity', 0.0),
            result.impacts.get('fossil_resources', 0.0),
            result.impacts.get('mineral_resources', 0.0),
            result.impacts.get('water_use', 0.0),
            result.impacts.get('land_use', 0.0),
            result.impacts.get('ionizing_radiation', 0.0),
            result.impacts.get('photochemical_ozone', 0.0),
            result.impacts.get('particulates', 0.0),
            result.impacts.get('ozone_depletion', 0.0),
            result.environmental_cost,
            result.pef_score,
        ))
        
        result_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return result_id
    
    def get_result(self, result_id: int) -> Optional[Dict]:
        """Recupera un risultato salvato"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM product_lca WHERE id = ?", (result_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))
    
    def list_results(self, limit: int = 10) -> List[Dict]:
        """Elenca i risultati salvati"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, product_name, total_mass, climate_change, pef_score, created_at
            FROM product_lca ORDER BY created_at DESC LIMIT ?
        """, (limit,))
        
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return results


def create_tshirt_example() -> LCAInput:
    """
    Crea un esempio di LCA per un T-shirt in cotone.
    Basato sul file LCA TIPICO.txt (ADEME Base Empreinte).
    """
    engine = LCAEngine()
    
    # Materiale: cotone
    cotton = engine.get_material('ei-coton')
    
    # Processi reali dal database ADEME
    dyeing = engine.get_process('c8be445c-ae33-5240-9007-e7973e97fc24')  # Teinture en continu
    knitting = engine.get_process('ddcf4b23-1283-57d3-854b-be3121452d50')  # Tricotage circulaire
    cutting = engine.get_process('b7fa51fc-0421-57b0-bb0a-e0573e293c7a')  # Teinture moyenne
    
    # Se alcuni processi non esistono, usa processi alternativi
    if not dyeing:
        dyeing = engine.get_process('b7fa51fc-0421-57b0-bb0a-e0573e293c7a')
    if not knitting:
        knitting = engine.get_process('ddcf4b23-1283-57d3-854b-be3121452d50')
    if not cutting:
        cutting = engine.get_process('c8be445c-ae33-5240-9007-e7973e97fc24')
    
    # Trasporti
    maritime_transport = Transport(
        mode='maritime',
        distance_km=6800,
        mass_kg=0.2344,
        emission_factors=engine._get_transport_factor('maritime')
    )
    
    road_transport = Transport(
        mode='road',
        distance_km=2200,
        mass_kg=0.2344,
        emission_factors=engine._get_transport_factor('road')
    )
    
    # Componente principale: tessuto
    fabric = ProductComponent(
        name="Tessuto (cotone)",
        material=cotton,
        mass_kg=0.2344,
        processes=[dyeing, knitting, cutting],
        transports=[maritime_transport, road_transport],
        loss_rate=0.14,  # 14% perdite
    )
    
    return LCAInput(
        product_name="T-shirt cotone",
        functional_unit="1 T-shirt",
        components=[fabric],
        use_phase_energy_kwh=5.0,  # 5 lavaggi
        use_phase_water_kg=77.6,
        use_phase_detergent_kg=0.254,
        end_of_life_transport_km=200,
    )


if __name__ == "__main__":
    # Test rapido
    engine = LCAEngine()
    print("Database connesso:", engine.db_path)
    
    # Conta record
    conn = engine._get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM processes")
    print("Processi:", cursor.fetchone()[0])
    cursor.execute("SELECT COUNT(*) FROM materials")
    print("Materiali:", cursor.fetchone()[0])
    conn.close()
    
    # Esempio T-shirt
    print("\n--- Calcolo T-shirt ---")
    tshirt = create_tshirt_example()
    result = engine.calculate(tshirt)
    
    print(f"Prodotto: {result.product_name}")
    print(f"Massa totale: {result.total_mass_kg:.4f} kg")
    print(f"\nImpatto cambiamento climatico: {result.impacts['climate_change']:.4f} kg CO₂e")
    print(f"Score PEF: {result.pef_score:.2f} µPt")
    print(f"Coût environnemental: {result.environmental_cost:.2f} Pts")
    
    print("\nRipartizione per fase:")
    for phase, impacts in result.phase_impacts.items():
        print(f"  {phase}: {impacts['climate_change']:.4f} kg CO₂e")
    
    # Salva risultato
    result_id = engine.save_result(result)
    print(f"\nRisultato salvato con ID: {result_id}")
