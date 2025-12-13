import qrcode
import uuid
import io

def generate_qr_image(user_id: str):
    qr_id = str(uuid.uuid4())

    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(f"user:{user_id}")
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Store PNG in memory
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return qr_id, buf
