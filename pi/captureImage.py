import time

from picamera2 import Picamera2, Preview

def capture_photo(filename):
    picam2 = Picamera2()

    preview_config = picam2.create_preview_configuration(main={"size": (800, 600)})
    picam2.configure(preview_config)

    picam2.start_preview(Preview.QTGL)

    picam2.start()
    time.sleep(5)
    
    picam2.capture_file(filename)
    picam2.close()