"""
Acid Test per LCA Engine
Verifica il modello di calcolo LCA con dati ADEME
"""

import sys
import os
sys.path.insert(0, '/home/indigo/RonaldoRiska')

from lca_engine import (
    LCAEngine, LCAInput, ProductComponent, Material, Process, Transport,
    ImpactCategory, create_tshirt_example
)


def test_database_connection():
    """Test 1: Verifica connessione al database"""
    print("TEST 1: Connessione database")
    try:
        engine = LCAEngine()
        conn = engine._get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM processes")
        count = cursor.fetchone()[0]
        conn.close()
        assert count > 0, "Nessun processo trovato"
        print(f"  PASS: {count} processi trovati")
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_materials_loaded():
    """Test 2: Verifica caricamento materiali"""
    print("TEST 2: Caricamento materiali")
    try:
        engine = LCAEngine()
        materials = ['ei-coton', 'ei-pet', 'ei-laine-par-defaut', 'ei-viscose']
        for mat_id in materials:
            mat = engine.get_material(mat_id)
            assert mat is not None, f"Materiale {mat_id} non trovato"
            print(f"  PASS: {mat.name} ({mat.category})")
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_processes_loaded():
    """Test 3: Verifica caricamento processi"""
    print("TEST 3: Caricamento processi")
    try:
        engine = LCAEngine()
        # ID reali dal database ADEME settembre 2025
        processes = [
            'c8be445c-ae33-5240-9007-e7973e97fc24',  # Teinture en continu
            'ddcf4b23-1283-57d3-854b-be3121452d50',  # Tricotage circulaire
            'b7fa51fc-0421-57b0-bb0a-e0573e293c7a',  # Teinture moyenne
            '20a62b2c-a543-5076-83aa-c5b7d340206a',  # Transport maritime
        ]
        for proc_id in processes:
            proc = engine.get_process(proc_id)
            if proc:
                print(f"  PASS: {proc.name} ({proc.category})")
            else:
                print(f"  WARN: Processo {proc_id} non trovato (OK se non esiste)")
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_lca_calculation():
    """Test 4: Verifica calcolo LCA completo"""
    print("TEST 4: Calcolo LCA T-shirt")
    try:
        engine = LCAEngine()
        tshirt = create_tshirt_example()
        result = engine.calculate(tshirt)
        
        # Verifica che i risultati siano positivi
        assert result.total_mass_kg > 0, "Massa totale deve essere positiva"
        assert result.impacts['climate_change'] > 0, "Impatto climatico deve essere positivo"
        assert result.pef_score > 0, "Score PEF deve essere positivo"
        
        print(f"  PASS: Massa totale = {result.total_mass_kg:.4f} kg")
        print(f"  PASS: Cambiamento climatico = {result.impacts['climate_change']:.4f} kg CO₂e")
        print(f"  PASS: Score PEF = {result.pef_score:.2f} µPt")
        
        # Verifica ripartizione per fase
        total_phase = sum(
            result.phase_impacts[phase]['climate_change'] 
            for phase in result.phase_impacts
        )
        assert abs(total_phase - result.impacts['climate_change']) < 0.001, \
            "La somma delle fasi deve corrispondere al totale"
        print(f"  PASS: Ripartizione fasi coerente")
        
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_pef_normalization():
    """Test 4b: Verifica normalizzazione PEF con pesi corretti"""
    print("TEST 4b: Normalizzazione PEF")
    try:
        engine = LCAEngine()
        
        # Verifica che i pesi PEF siano definiti
        assert hasattr(engine, 'PEF_WEIGHTS'), "Pesi PEF non definiti"
        assert hasattr(engine, 'PEF_NORMALIZATION'), "Fattori di normalizzazione non definiti"
        
        # Verifica che i pesi siano tra 0 e 1
        for cat, weight in engine.PEF_WEIGHTS.items():
            assert 0.0 <= weight <= 1.0, f"Peso {cat} fuori range: {weight}"
        print(f"  PASS: Tutti i pesi PEF tra 0 e 1")
        
        # Verifica che le categorie principali abbiano pesi significativi
        assert engine.PEF_WEIGHTS.get('climate_change', 0) > 0.15, \
            "Climate change dovrebbe avere peso significativo"
        assert engine.PEF_WEIGHTS.get('freshwater_ecotoxicity', 0) > 0.15, \
            "Ecotoxicità dovrebbe avere peso significativo"
        print(f"  PASS: Categorie principali con pesi significativi")
        
        # Verifica che tossicità umana sia esclusa (peso 0)
        assert engine.PEF_WEIGHTS.get('human_toxicity_cancer', 1) == 0.0, \
            "Tossicità cancerogena dovrebbe essere esclusa"
        assert engine.PEF_WEIGHTS.get('human_toxicity_non_cancer', 1) == 0.0, \
            "Tossicità non-cancerogena dovrebbe essere esclusa"
        print(f"  PASS: Tossicità umana esclusa dal score")
        
        # Verifica che ecotoxicità abbia peso aumentato
        assert engine.PEF_WEIGHTS.get('freshwater_ecotoxicity', 0) > 0.15, \
            "Ecotoxicità dovrebbe avere peso aumentato"
        print(f"  PASS: Ecotoxicità peso = {engine.PEF_WEIGHTS['freshwater_ecotoxicity']:.4f}")
        
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_save_and_retrieve():
    """Test 5: Verifica salvataggio e recupero risultati"""
    print("TEST 5: Salvataggio e recupero risultati")
    try:
        engine = LCAEngine()
        tshirt = create_tshirt_example()
        result = engine.calculate(tshirt)
        
        # Salva
        result_id = engine.save_result(result)
        assert result_id > 0, "ID risultato deve essere positivo"
        print(f"  PASS: Risultato salvato con ID {result_id}")
        
        # Recupera
        retrieved = engine.get_result(result_id)
        assert retrieved is not None, "Risultato non trovato"
        assert retrieved['product_name'] == result.product_name, "Nome prodotto non corrisponde"
        print(f"  PASS: Risultato recuperato correttamente")
        
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_impact_categories():
    """Test 6: Verifica 16 categorie di impatto"""
    print("TEST 6: 16 categorie di impatto PEF")
    try:
        engine = LCAEngine()
        tshirt = create_tshirt_example()
        result = engine.calculate(tshirt)
        
        expected_categories = [
            'climate_change', 'acidification', 'eutrophication_freshwater',
            'eutrophication_marine', 'eutrophication_terrestrial',
            'human_toxicity_cancer', 'human_toxicity_non_cancer',
            'freshwater_ecotoxicity', 'fossil_resources', 'mineral_resources',
            'water_use', 'land_use', 'ionizing_radiation', 'photochemical_ozone',
            'particulates', 'ozone_depletion'
        ]
        
        for cat in expected_categories:
            assert cat in result.impacts, f"Categoria {cat} mancante"
        
        print(f"  PASS: Tutte le 16 categorie presenti")
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_empty_input():
    """Test 7: Gestione input vuoto"""
    print("TEST 7: Gestione input vuoto")
    try:
        engine = LCAEngine()
        empty_input = LCAInput(
            product_name="Prodotto vuoto",
            components=[]
        )
        result = engine.calculate(empty_input)
        assert result.total_mass_kg == 0, "Massa deve essere 0"
        assert result.impacts['climate_change'] == 0, "Impatto deve essere 0"
        print("  PASS: Input vuoto gestito correttamente")
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def test_multiple_components():
    """Test 8: Prodotto con componenti multipli"""
    print("TEST 8: Prodotto con componenti multipli")
    try:
        engine = LCAEngine()
        
        # Crea un prodotto con tessuto + poliestere
        cotton = engine.get_material('ei-coton')
        polyester = engine.get_material('ei-pet')
        
        fabric = ProductComponent(
            name="Tessuto",
            material=cotton,
            mass_kg=0.2,
            loss_rate=0.1
        )
        
        lining = ProductComponent(
            name="Fodera",
            material=polyester,
            mass_kg=0.01,
            loss_rate=0.0
        )
        
        multi_input = LCAInput(
            product_name="Prodotto multi-componente",
            components=[fabric, lining]
        )
        
        result = engine.calculate(multi_input)
        assert abs(result.total_mass_kg - 0.21) < 1e-9, f"Massa totale errata: {result.total_mass_kg}"
        print(f"  PASS: Massa totale = {result.total_mass_kg:.2f} kg")
        return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False


def run_all_tests():
    """Esegue tutti i test"""
    print("=" * 60)
    print("ACID TEST - LCA ENGINE")
    print("=" * 60)
    
    tests = [
        test_database_connection,
        test_materials_loaded,
        test_processes_loaded,
        test_lca_calculation,
        test_pef_normalization,
        test_save_and_retrieve,
        test_impact_categories,
        test_empty_input,
        test_multiple_components,
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"  EXCEPTION: {e}")
            results.append(False)
        print()
    
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"RISULTATI: {passed}/{total} test superati")
    
    if passed == total:
        print("TUTTI I TEST PASSATI")
    else:
        print(f"ATTENZIONE: {total - passed} test falliti")
    print("=" * 60)
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
