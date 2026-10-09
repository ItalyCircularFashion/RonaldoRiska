#!/usr/bin/env python3
"""
PDF Converter - Convertitore multi-formato locale
Autore: Ronaldo Riska
Versione: 1.0

Formati supportati:
  - JPG/JPEG/PNG → PDF
  - PDF → JPG/PNG
  - TXT → PDF
  - PDF → TXT
  - Unisci PDF
  - Dividi PDF
  - Comprimi PDF (riduzione qualità immagini)

Dipendenze: pip install fpdf2 Pillow pypdf
"""

import os
import sys
import glob
import io
from pathlib import Path

# ── Dipendenze opzionali con messaggi chiari ──

def check_deps():
    missing = []
    try:
        from fpdf import FPDF
    except ImportError:
        missing.append("fpdf2")
    try:
        from PIL import Image
    except ImportError:
        missing.append("Pillow")
    try:
        from pypdf import PdfReader, PdfWriter
    except ImportError:
        try:
            from PyPDF2 import PdfReader, PdfWriter
        except ImportError:
            missing.append("pypdf")
    if missing:
        print(f"\n❌ Dipendenze mancanti: {', '.join(missing)}")
        print("   Installa con: pip install " + " ".join(missing))
        sys.exit(1)

check_deps()

from fpdf import FPDF
from PIL import Image
try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    from PyPDF2 import PdfReader, PdfWriter


# ── Utility ──

def get_files(pattern, description="file"):
    """Trova file con pattern glob."""
    files = sorted(glob.glob(pattern))
    if not files:
        print(f"   Nessun {description} trovato con pattern: {pattern}")
    return files


def ask_path(prompt, must_exist=True):
    """Chiede un percorso all'utente."""
    while True:
        path = input(prompt).strip().strip('"').strip("'")
        path = os.path.expanduser(path)
        if must_exist and not os.path.exists(path):
            print(f"   ❌ Percorso non trovato: {path}")
            continue
        return path


def ask_output(prompt="Nome file di output: ", default="output.pdf"):
    """Chiede il nome del file di output."""
    name = input(prompt).strip() or default
    if not name.lower().endswith('.pdf'):
        name += '.pdf'
    return name


# ── Convertitori ──

def images_to_pdf():
    """Converte immagini JPG/PNG in un unico PDF."""
    print("\n📷 Immagini → PDF")
    cartella = ask_path("   Cartella con immagini (es: ~/Immagini): ")
    
    exts = ('*.jpg', '*.jpeg', '*.png', '*.bmp', '*.gif', '*.tiff', '*.webp')
    immagini = []
    for ext in exts:
        immagini.extend(glob.glob(os.path.join(cartella, ext)))
        immagini.extend(glob.glob(os.path.join(cartella, ext.upper())))
    immagini = sorted(set(immagini))
    
    if not immagini:
        print("   Nessuna immagine trovata.")
        return
    
    print(f"   Trovate {len(immagini)} immagini:")
    for i, img in enumerate(immagini[:10], 1):
        print(f"     {i}. {os.path.basename(img)}")
    if len(immagini) > 10:
        print(f"     ... e altre {len(immagini) - 10}")
    
    output = ask_output("   Nome PDF di output (default: output.pdf): ", "output.pdf")
    output_path = os.path.join(cartella, output)
    
    pdf = FPDF()
    for img_path in immagini:
        try:
            img = Image.open(img_path)
            w, h = img.size
            # Scala per stare nella pagina A4 (210x297mm)
            max_w, max_h = 190, 277
            ratio = min(max_w / w, max_h / h)
            w_mm, h_mm = w * ratio, h * ratio
            x = (210 - w_mm) / 2
            y = (297 - h_mm) / 2
            
            pdf.add_page()
            pdf.image(img_path, x=x, y=y, w=w_mm, h=h_mm)
        except Exception as e:
            print(f"   ⚠️  Errore con {os.path.basename(img_path)}: {e}")
    
    pdf.output(output_path)
    print(f"   ✅ PDF creato: {output_path}")


def pdf_to_images():
    """Converte pagine PDF in immagini JPG/PNG."""
    print("\n📄 PDF → Immagini")
    pdf_path = ask_path("   Percorso del file PDF: ")
    
    output_dir = input("   Cartella di output (stessa del PDF se vuoto): ").strip()
    if not output_dir:
        output_dir = os.path.dirname(pdf_path)
    output_dir = os.path.expanduser(output_dir)
    os.makedirs(output_dir, exist_ok=True)
    
    fmt = input("   Formato immagine (jpg/png, default: jpg): ").strip().lower() or "jpg"
    if fmt not in ('jpg', 'png'):
        fmt = 'jpg'
    
    try:
        reader = PdfReader(pdf_path)
        total = len(reader.pages)
        print(f"   Il PDF ha {total} pagine.")
        
        base = Path(pdf_path).stem
        for i, page in enumerate(reader.pages, 1):
            # Estrai immagini dalla pagina
            if '/XObject' in page['/Resources']:
                xobjects = page['/Resources']['/XObject'].get_object()
                for obj_name in xobjects:
                    obj = xobjects[obj_name].get_object()
                    if obj['/Subtype'] == '/Image':
                        try:
                            if obj['/Filter'] == '/DCTDecode':
                                ext = 'jpg'
                                data = obj._data
                            elif obj['/Filter'] == '/FlateDecode':
                                ext = 'png'
                                # Ricostruisci immagine da raw data
                                w = obj['/Width']
                                h = obj['/Height']
                                cs = obj.get('/ColorSpace', '/DeviceRGB')
                                if cs == '/DeviceRGB':
                                    mode = 'RGB'
                                elif cs == '/DeviceGray':
                                    mode = 'L'
                                else:
                                    mode = 'RGB'
                                data = obj._data
                                from PIL import Image as PILImage
                                img = PILImage.frombytes(mode, (w, h), data)
                                out_path = os.path.join(output_dir, f"{base}_p{i}_{obj_name[1:]}.{fmt}")
                                img.save(out_path, fmt.upper())
                                print(f"   ✅ Salvata: {os.path.basename(out_path)}")
                                continue
                            else:
                                continue
                            
                            out_path = os.path.join(output_dir, f"{base}_p{i}_{obj_name[1:]}.{ext}")
                            with open(out_path, 'wb') as f:
                                f.write(data)
                            print(f"   ✅ Salvata: {os.path.basename(out_path)}")
                        except Exception as e:
                            print(f"   ⚠️  Errore estrazione immagine: {e}")
            
            # Se non ci sono immagini, prova a renderizzare la pagina
            print(f"   ℹ️  Pagina {i}: nessuna immagine trovata, usa 'PDF → TXT' per il testo")
        
        print(f"   ✅ Conversione completata in: {output_dir}")
    except Exception as e:
        print(f"   ❌ Errore: {e}")


def txt_to_pdf():
    """Converte file TXT in PDF."""
    print("\n📝 TXT → PDF")
    txt_path = ask_path("   Percorso del file TXT: ")
    
    output = ask_output("   Nome PDF di output (default: output.pdf): ", "output.pdf")
    output_path = os.path.join(os.path.dirname(txt_path), output)
    
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    
    with open(txt_path, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            pdf.multi_cell(0, 6, line.rstrip())
    
    pdf.output(output_path)
    print(f"   ✅ PDF creato: {output_path}")


def pdf_to_txt():
    """Estrae testo da PDF."""
    print("\n📄 PDF → TXT")
    pdf_path = ask_path("   Percorso del file PDF: ")
    
    output = ask_output("   Nome TXT di output (default: output.txt): ", "output.txt")
    if not output.lower().endswith('.txt'):
        output += '.txt'
    output_path = os.path.join(os.path.dirname(pdf_path), output)
    
    try:
        reader = PdfReader(pdf_path)
        text_parts = []
        for i, page in enumerate(reader.pages, 1):
            text = page.extract_text()
            if text:
                text_parts.append(f"--- Pagina {i} ---\n{text}")
        
        full_text = "\n\n".join(text_parts)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        
        print(f"   ✅ Testo estratto: {output_path}")
        print(f"   📊 {len(reader.pages)} pagine, {len(full_text)} caratteri")
    except Exception as e:
        print(f"   ❌ Errore: {e}")


def merge_pdfs():
    """Unisce più PDF in uno."""
    print("\n🔗 Unisci PDF")
    print("   Inserisci i PDF da unire (uno per riga, riga vuota per terminare):")
    
    pdf_files = []
    while True:
        path = input(f"   PDF #{len(pdf_files) + 1}: ").strip().strip('"').strip("'")
        if not path:
            break
        path = os.path.expanduser(path)
        if os.path.exists(path):
            pdf_files.append(path)
        else:
            print(f"   ❌ File non trovato: {path}")
    
    if len(pdf_files) < 2:
        print("   Servono almeno 2 PDF da unire.")
        return
    
    output = ask_output("   Nome PDF unificato (default: merged.pdf): ", "merged.pdf")
    output_path = os.path.join(os.path.dirname(pdf_files[0]), output)
    
    writer = PdfWriter()
    for pdf_path in pdf_files:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            writer.add_page(page)
    
    with open(output_path, 'wb') as f:
        writer.write(f)
    
    print(f"   ✅ PDF unificato: {output_path}")
    print(f"   📊 {len(pdf_files)} file, {len(writer.pages)} pagine totali")


def split_pdf():
    """Divide un PDF in più file."""
    print("\n✂️  Dividi PDF")
    pdf_path = ask_path("   Percorso del file PDF: ")
    
    reader = PdfReader(pdf_path)
    total = len(reader.pages)
    print(f"   Il PDF ha {total} pagine.")
    
    print("   Modalità di divisione:")
    print("     1. Per pagina (ogni pagina = un PDF)")
    print("     2. Per intervallo (es: 1-5, 6-10, ...)")
    print("     3. Per gruppi (es: 5 pagine per gruppo)")
    
    mode = input("   Scegli (1/2/3): ").strip()
    base = Path(pdf_path).stem
    output_dir = os.path.dirname(pdf_path)
    
    if mode == '1':
        for i, page in enumerate(reader.pages, 1):
            writer = PdfWriter()
            writer.add_page(page)
            out_path = os.path.join(output_dir, f"{base}_pagina_{i}.pdf")
            with open(out_path, 'wb') as f:
                writer.write(f)
        print(f"   ✅ {total} PDF creati in: {output_dir}")
    
    elif mode == '2':
        print("   Inserisci intervalli (es: 1-5, 6-10, riga vuota per terminare):")
        intervals = []
        while True:
            line = input("   Intervallo: ").strip()
            if not line:
                break
            try:
                parts = line.split('-')
                start, end = int(parts[0]), int(parts[1])
                if 1 <= start <= end <= total:
                    intervals.append((start, end))
                else:
                    print(f"   ❌ Intervallo non valido (1-{total})")
            except ValueError:
                print("   ❌ Formato non valido. Usa: inizio-fine")
        
        for idx, (start, end) in enumerate(intervals, 1):
            writer = PdfWriter()
            for i in range(start - 1, end):
                writer.add_page(reader.pages[i])
            out_path = os.path.join(output_dir, f"{base}_p{start}-{end}.pdf")
            with open(out_path, 'wb') as f:
                writer.write(f)
            print(f"   ✅ {os.path.basename(out_path)} ({end - start + 1} pagine)")
    
    elif mode == '3':
        size = input("   Pagine per gruppo: ").strip()
        try:
            size = int(size)
            if size < 1:
                raise ValueError
        except ValueError:
            print("   ❌ Numero non valido.")
            return
        
        groups = (total + size - 1) // size
        for g in range(groups):
            writer = PdfWriter()
            start = g * size
            end = min(start + size, total)
            for i in range(start, end):
                writer.add_page(reader.pages[i])
            out_path = os.path.join(output_dir, f"{base}_gruppo_{g+1}_p{start+1}-{end}.pdf")
            with open(out_path, 'wb') as f:
                writer.write(f)
            print(f"   ✅ {os.path.basename(out_path)} ({end - start} pagine)")
    
    else:
        print("   ❌ Scelta non valida.")


def compress_pdf():
    """Comprime un PDF riducendo la qualità delle immagini."""
    print("\n🗜️  Comprimi PDF")
    pdf_path = ask_path("   Percorso del file PDF: ")
    
    output = ask_output("   Nome PDF compresso (default: compressed.pdf): ", "compressed.pdf")
    output_path = os.path.join(os.path.dirname(pdf_path), output)
    
    quality = input("   Qualità immagini (1-100, default: 50): ").strip()
    try:
        quality = int(quality)
        quality = max(1, min(100, quality))
    except ValueError:
        quality = 50
    
    try:
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        
        for page in reader.pages:
            writer.add_page(page)
        
        # Comprimi immagini
        for page in writer.pages:
            if '/XObject' in page['/Resources']:
                xobjects = page['/Resources']['/XObject'].get_object()
                for obj_name in xobjects:
                    obj = xobjects[obj_name].get_object()
                    if obj['/Subtype'] == '/Image':
                        try:
                            if obj['/Filter'] == '/FlateDecode':
                                w = obj['/Width']
                                h = obj['/Height']
                                cs = obj.get('/ColorSpace', '/DeviceRGB')
                                mode = 'RGB' if cs == '/DeviceRGB' else 'L'
                                data = obj._data
                                img = Image.frombytes(mode, (w, h), data)
                                
                                # Riduci dimensioni se troppo grandi
                                max_dim = 1500
                                if max(w, h) > max_dim:
                                    ratio = max_dim / max(w, h)
                                    img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
                                
                                # Salva con qualità ridotta
                                buf = io.BytesIO()
                                img.save(buf, format='JPEG', quality=quality, optimize=True)
                                obj._data = buf.getvalue()
                                obj['/Filter'] = None  # Rimuovi filtro vecchio
                        except Exception as e:
                            print(f"   ⚠️  Errore compressione immagine: {e}")
        
        with open(output_path, 'wb') as f:
            writer.write(f)
        
        orig_size = os.path.getsize(pdf_path)
        new_size = os.path.getsize(output_path)
        ratio = (1 - new_size / orig_size) * 100
        print(f"   ✅ PDF compresso: {output_path}")
        print(f"   📊 {orig_size // 1024}KB → {new_size // 1024}KB ({ratio:.1f}% riduzione)")
    except Exception as e:
        print(f"   ❌ Errore: {e}")


def batch_convert():
    """Conversione batch di più file."""
    print("\n⚡ Conversione batch")
    print("   Cartella con file da convertire:")
    cartella = ask_path("   Percorso cartella: ")
    
    print("   Tipo di conversione:")
    print("     1. Tutte le immagini → PDF")
    print("     2. Tutti i PDF → TXT")
    print("     3. Tutti i TXT → PDF")
    
    choice = input("   Scegli (1/2/3): ").strip()
    
    if choice == '1':
        exts = ('*.jpg', '*.jpeg', '*.png', '*.bmp')
        files = []
        for ext in exts:
            files.extend(glob.glob(os.path.join(cartella, ext)))
        files = sorted(set(files))
        
        if not files:
            print("   Nessuna immagine trovata.")
            return
        
        output = ask_output("   Nome PDF di output (default: batch.pdf): ", "batch.pdf")
        output_path = os.path.join(cartella, output)
        
        pdf = FPDF()
        for img_path in files:
            try:
                img = Image.open(img_path)
                w, h = img.size
                max_w, max_h = 190, 277
                ratio = min(max_w / w, max_h / h)
                w_mm, h_mm = w * ratio, h * ratio
                x = (210 - w_mm) / 2
                y = (297 - h_mm) / 2
                pdf.add_page()
                pdf.image(img_path, x=x, y=y, w=w_mm, h=h_mm)
            except Exception as e:
                print(f"   ⚠️  Errore con {os.path.basename(img_path)}: {e}")
        
        pdf.output(output_path)
        print(f"   ✅ PDF creato: {output_path} ({len(files)} immagini)")
    
    elif choice == '2':
        pdfs = sorted(glob.glob(os.path.join(cartella, '*.pdf')))
        if not pdfs:
            print("   Nessun PDF trovato.")
            return
        
        for pdf_path in pdfs:
            try:
                reader = PdfReader(pdf_path)
                text_parts = []
                for i, page in enumerate(reader.pages, 1):
                    text = page.extract_text()
                    if text:
                        text_parts.append(f"--- Pagina {i} ---\n{text}")
                
                full_text = "\n\n".join(text_parts)
                out_path = os.path.join(cartella, Path(pdf_path).stem + ".txt")
                with open(out_path, 'w', encoding='utf-8') as f:
                    f.write(full_text)
                print(f"   ✅ {os.path.basename(out_path)}")
            except Exception as e:
                print(f"   ❌ Errore con {os.path.basename(pdf_path)}: {e}")
    
    elif choice == '3':
        txts = sorted(glob.glob(os.path.join(cartella, '*.txt')))
        if not txts:
            print("   Nessun TXT trovato.")
            return
        
        for txt_path in txts:
            try:
                pdf = FPDF()
                pdf.set_auto_page_break(auto=True, margin=15)
                pdf.add_page()
                pdf.set_font("Arial", size=11)
                
                with open(txt_path, 'r', encoding='utf-8', errors='replace') as f:
                    for line in f:
                        pdf.multi_cell(0, 6, line.rstrip())
                
                out_path = os.path.join(cartella, Path(txt_path).stem + ".pdf")
                pdf.output(out_path)
                print(f"   ✅ {os.path.basename(out_path)}")
            except Exception as e:
                print(f"   ❌ Errore con {os.path.basename(txt_path)}: {e}")
    
    else:
        print("   ❌ Scelta non valida.")


# ── Menu principale ──

def show_menu():
    print("\n" + "=" * 50)
    print("  📄 PDF CONVERTER - Convertitore Multi-Formato")
    print("=" * 50)
    print("\n  Conversioni disponibili:")
    print("    1. 📷 Immagini → PDF (JPG, PNG, BMP, ...)")
    print("    2. 📄 PDF → Immagini (JPG, PNG)")
    print("    3. 📝 TXT → PDF")
    print("    4. 📄 PDF → TXT")
    print("    5. 🔗 Unisci PDF")
    print("    6. ✂️  Dividi PDF")
    print("    7. 🗜️  Comprimi PDF")
    print("    8. ⚡ Conversione batch")
    print("    0. 🚪 Esci")
    print()


def main():
    print("\n🔧 Verifica dipendenze...")
    
    while True:
        show_menu()
        choice = input("  Scegli un'opzione (0-8): ").strip()
        
        if choice == '0':
            print("\n  👋 Arrivederci!\n")
            break
        elif choice == '1':
            images_to_pdf()
        elif choice == '2':
            pdf_to_images()
        elif choice == '3':
            txt_to_pdf()
        elif choice == '4':
            pdf_to_txt()
        elif choice == '5':
            merge_pdfs()
        elif choice == '6':
            split_pdf()
        elif choice == '7':
            compress_pdf()
        elif choice == '8':
            batch_convert()
        else:
            print("  ❌ Opzione non valida.")
        
        input("\n  Premi Invio per continuare...")


if __name__ == "__main__":
    main()
