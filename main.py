import telegram
import time
import csv
import os
from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# --- CONFIGURACIÓN ---
# Pon tu Token de Telegram aquí
BOT_TOKEN = "TU_TOKEN_AQUI"  # Ej: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ

# --- FUNCIONES ---

def start(update: Update, context: CallbackContext):
    """Muestra el mensaje de bienvenida"""
    user = update.message.from_user
    update.message.reply_text(
        f"¡Hola {user.first_name}! 👋\n\n"
        "Soy tu CC Checker.\n\n"
        "1. Sube un archivo .txt con las tarjetas (Formato: NUMERO|MES|AÑO|CVV)\n"
        "2. El bot las verificará y te enviará un archivo con las 'LIVES'.\n\n"
        "Ejemplo de línea: 4111111111111111|12|2025|123"
    )

def check_cc(card_details):
    """
    Verifica una tarjeta usando una API pública o método simple.
    Nota: Para producción real, se usa una API como 'Stripe' o 'RawCC', 
    pero para este ejemplo usaremos una verificación básica con 'requests' 
    a una API gratuita o simulación si no tienes clave de API.
    
    Aquí usaremos una API gratuita de ejemplo: https://api.nubank.com.br/api/v3/cards/{card}/transactions
    (Nota: Las APIs gratuitas suelen tener límites).
    """
    try:
        # Dividir los detalles
        parts = card_details.strip().split('|')
        if len(parts) != 4:
            return None, "Formato incorrecto"
        
        number, month, year, cvv = parts
        
        # Limpieza básica
        number = number.strip()
        month = month.strip().zfill(2)
        year = year.strip()
        cvv = cvv.strip()
        
        # Verificación básica de longitud
        if len(number) < 13 or len(number) > 19:
            return None, "Número muy corto/largo"
            
        # Aquí iría la lógica real de verificación.
        # Como ejemplo, usaremos una API gratuita de prueba (puede requerir clave API)
        # O simplemente devolveremos un estado aleatorio para probar la UI
        
        # SIMULACIÓN DE VERIFICACIÓN (Cámbialo por una API real si quieres precisión)
        import random
        status = random.choice(["LIVE", "DEAD", "INTERCHANGE"])
        
        return status, f"{number}|{month}|{year}|{cvv}"
        
    except Exception as e:
        return None, f"Error: {str(e)}"

def handle_document(update: Update, context: CallbackContext):
    """Maneja el archivo subido por el usuario"""
    user = update.message.from_user
    doc = update.message.document
    
    # Descargar el archivo
    file_path = f"cards_{user.id}.txt"
    file_obj = context.bot.get_file(doc.file_id)
    file_obj.download_file(file_path)
    
    update.message.reply_text("📥 Archivo recibido. Verificando tarjetas... ⏳")
    
    lives = []
    deads = []
    total = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for line in lines:
            total += 1
            status, result = check_cc(line)
            
            if status == "LIVE":
                lives.append(result)
            elif status == "DEAD":
                deads.append(result)
            elif status == "INTERCHANGE":
                lives.append(f"INTERCHANGE: {result}")
            
            # Pequeña pausa para no saturar la API (ajustar según tu API)
            time.sleep(0.5)
            
        # Enviar resultados
        if lives:
            lives_text = "\n".join(lives)
            # Si hay muchas, dividirlas en mensajes
            for i in range(0, len(lives), 100):
                chunk = lives[i:i+100]
                update.message.reply_text(f"✅ LIVES ({len(chunk)}):\n{chr(10).join(chunk)}")
        else:
            update.message.reply_text("✅ No se encontraron LIVES (o todas fueron INTERCHANGE/DEAD).")
            
        update.message.reply_text(f"📊 Total procesadas: {total}\n✅ Lives: {len(lives)}\n❌ Dead: {len(deads)}")
        
        # Limpiar archivo
        os.remove(file_path)
        
    except Exception as e:
        update.message.reply_text(f"❌ Error al procesar: {str(e)}")

def main():
    print("Iniciando Bot CC Checker...")
    updater = Updater(BOT_TOKEN, use_context=True)
    dispatcher = updater.dispatcher
    
    # Manejadores
    dispatcher.add_handler(CommandHandler('start', start))
    dispatcher.add_handler(MessageHandler(Filters.document, handle_document))
    
    # Iniciar el bot
    updater.start_polling()
    print("Bot corriendo...")
    updater.idle()

if __name__ == '__main__':
    main()
