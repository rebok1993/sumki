from PIL import Image
import os

files = os.listdir("sumki_online/static/sumki_online/images/sumki/main")

for file in files:
    image_big = Image.open("sumki_online/static/sumki_online/images/sumki/main/"+file)
    new_image = image_big.resize((64,64), Image.ANTIALIAS)
    new_image.save("sumki_online/static/sumki_online/images/sumki/64_on_64/"+file)

