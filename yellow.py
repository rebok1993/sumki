from PIL import Image
import os

files = os.listdir("sumki_online/static/sumki_online/images/sumki/main")

for file in files:
    image_big = Image.open("sumki_online/static/sumki_online/images/sumki/main/"+file)
    new_image = image_big.resize((100,100), Image.ANTIALIAS)
    new_image.save("sumki_online/static/sumki_online/images/sumki/100_on_100/"+file)

