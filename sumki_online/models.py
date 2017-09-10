# -*- coding: utf-8 -*-
from django.db import models
from datetime import *
from django import forms

#КАТЕГОРИИ
class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название категории')
    alias = models.SlugField(verbose_name='Alias категории')

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
    def __str__(self):
        return "Категория %s" % self.name

#ТОВАРЫ
class Item(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название товара')
    price = models.IntegerField(default=0, verbose_name='Цена')
    image = models.CharField(max_length=255, verbose_name='Ссылка на картинку')
    discount = models.SmallIntegerField(default=0, verbose_name='Скидка')
    description = models.TextField(verbose_name='Описание')
    data = models.DateTimeField()
    number = models.IntegerField(default=0, verbose_name='Общее количество товара')
    sales = models.SmallIntegerField(default=0, verbose_name='Продан или нет товар')
    category = models.ForeignKey(Category)
    hit_sales = models.BooleanField(default=False, verbose_name='Хит продаж')
    new_item = models.BooleanField(default=False, verbose_name='Новый товар')

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self):
        return "Товар %s" % self.name

#ВСЁ ПО ПАРАМЕТРАМ ОБУВИ
class MaterialInternal(models.Model):
    name = models.CharField(max_length=255, verbose_name='Внутренний материал', default='',  blank=True)
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = "Внутренний материал"
        verbose_name_plural = "Внутренний материал"
class Season(models.Model):
    name = models.CharField(max_length=255, verbose_name='Сезон')
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = "Сезон"
        verbose_name_plural = "Сезон"
class MaterialInsole(models.Model):
    name = models.CharField(max_length=255, verbose_name='Материал стельки', default='',  blank=True)
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = "Материал стельки"
        verbose_name_plural = "Материал стельки"
class MaterialSole(models.Model):
    name = models.CharField(max_length=255, verbose_name='Материал подошвы', default='',  blank=True)
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = "Материал подошвы"
        verbose_name_plural = "Материал подошвы"
class TopMaterial(models.Model):
    name = models.CharField(verbose_name='Материал вверха', max_length=255, default='',  blank=True)
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = "Материал вверха"
        verbose_name_plural = "Материал вверха"
class Size(models.Model):
    name = models.SmallIntegerField(verbose_name='Размер')
    def __str__(self):
        return str(self.name)

    class Meta:
        verbose_name = "Размеры обуви"
        verbose_name_plural = "Размеры обуви"

class TypeObuv(models.Model):
    name = models.CharField(max_length=255, verbose_name='Тип обуви')

    class Meta:
        verbose_name = "Типы обуви"
        verbose_name_plural = "Типы обуви"

    def __str__(self):
        return "Тип обуви %s" % self.name

class BrendObuv(models.Model):
    name = models.CharField(max_length=255, verbose_name='Бренд обуви', default='', blank=True)

    class Meta:
        verbose_name = "Бренды обуви"
        verbose_name_plural = "Бренды обуви"

    def __str__(self):
        return "Бренд обуви %s" % self.name
#наличие определённых размеров
class StoreObuv(models.Model):
    item = models.ForeignKey(Item)
    size = models.ForeignKey(Size, verbose_name='Размер')
    number = models.SmallIntegerField(verbose_name='Количество', default=1)

    class Meta:
        verbose_name = "Склад обуви"
        verbose_name_plural = "Склад обуви"

    def __str__(self):
        return self.item.name


class OptionsObuv(models.Model):
    item = models.ForeignKey(Item)
    type = models.ForeignKey(TypeObuv, verbose_name='Тип обуви')
    brend = models.ForeignKey(BrendObuv, verbose_name='Бренд обуви')
    top_material = models.ForeignKey(TopMaterial, default=1, verbose_name='Материал вверха')
    material_sole = models.ForeignKey(MaterialSole, default=1, verbose_name='Материал подошвы')
    material_insole = models.ForeignKey(MaterialInsole, default=1, verbose_name='Материал стельки')
    internal_material = models.ForeignKey(MaterialInternal, default=1, verbose_name='Внутренний материал')
    season = models.ForeignKey(Season, default=1, verbose_name='Сезон')


#ВСЁ ПО ПАРАМЕТРАМ СУМОК
class TypeSumki(models.Model):
    name = models.CharField(max_length=255, verbose_name='Тип сумки')

    class Meta:
        verbose_name = "Типы сумок"
        verbose_name_plural = "Типы сумок"

    def __str__(self):
        return self.name

class BrendSumki(models.Model):
    name = models.CharField(max_length=255, verbose_name='Бренд сумок')

    class Meta:
        verbose_name = "Бренды сумок"
        verbose_name_plural = "Бренды сумок"

    def __str__(self):
        return self.name

class MaterialSumki(models.Model):
    name = models.CharField(max_length=255, verbose_name='Материал сумки', blank=True)

    class Meta:
        verbose_name = "Материал сумки"
        verbose_name_plural = "Материал сумки"

    def __str__(self):
        return self.name

class WidthSumki(models.Model):
    name = models.CharField(max_length=255, verbose_name='Ширина сумки', blank=True)

    class Meta:
        verbose_name = "Ширина сумки"
        verbose_name_plural = "Ширина сумки"

    def __str__(self):
        return self.name

class HeightSumki(models.Model):
    name = models.CharField(max_length=255, verbose_name='Высота сумки', blank=True)

    class Meta:
        verbose_name = "Высота сумки"
        verbose_name_plural = "Высота сумки"

    def __str__(self):
        return self.name

class DepthSumki(models.Model):
    name = models.CharField(max_length=255, verbose_name='Глубина сумки', blank=True)

    class Meta:
        verbose_name = "Глубина сумки"
        verbose_name_plural = "Глубина сумки"

    def __str__(self):
        return self.name

class Color(models.Model):
    name = models.CharField(max_length=255, verbose_name='Цвет', blank=True)

    class Meta:
        verbose_name = "Цвет"
        verbose_name_plural = "Цвет"

    def __str__(self):
        return self.name


class OptionsSumki(models.Model):
    item = models.ForeignKey(Item)
    type = models.ForeignKey(TypeSumki)
    brend = models.ForeignKey(BrendSumki)
    material = models.ForeignKey(MaterialSumki, default='1')
    width = models.ForeignKey(WidthSumki, default='1')
    height = models.ForeignKey(HeightSumki, default='1')
    depth = models.ForeignKey(DepthSumki, default='1')
    color = models.ForeignKey(Color, default='1')
    dop_des = models.TextField(verbose_name='Доп. описание', default='')


#ПРОЧИЕ МОДЕЛИ
class MainOffer(models.Model):
    image = models.CharField(max_length=255, verbose_name='Ссылка на картинку')
    color = models.CharField(max_length=255, verbose_name='Цвет фона')
    link = models.CharField(max_length=255, verbose_name='Ссылка на каталог с параметрами')

    class Meta:
        verbose_name = "Специальные предложения"
        verbose_name_plural = "Специальные предложения"

class NumberViews(models.Model):
    item = models.ForeignKey(Item)
    number = models.SmallIntegerField(verbose_name='Количество просмотров')
    data = models.DateTimeField(verbose_name='Дата последнего просмотра')

    class Meta:
        verbose_name = "Количество просмотров по товарам"
        verbose_name_plural = "Количество просмотров по товарам"

# ВСЁ ПО ЗАКАЗАМ
class OrderForm(forms.Form):
    name = forms.CharField(
        max_length=100, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Введите имя'}))
    surname = forms.CharField(
        max_length=100, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Введите фамилию'}))
    fon_number = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control bfh-phone', 'placeholder': 'Введите номер телефона', 'data-format': '+7 (ddd) ddd-dddd'}))
    '''
    city = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Введите населённый пункт'}))
    '''

    city = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Выберите город доставки'}))

    adress = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Введите улицу, дом, квартиру'}))



# данные о покупателе товара и месте доставки(тут ID заказа)
class Order_params(models.Model):
    name = models.CharField(max_length=255, verbose_name='Имя покупателя')
    surname = models.CharField(max_length=255, verbose_name='Фамилия покупателя')
    adress = models.CharField(max_length=255, verbose_name='Адрес доставки', default='Самовывоз')
    #delivery = models.CharField(max_length=255, verbose_name='Вариант получения товара', default='Самовывоз')
    data = models.DateTimeField(auto_now=True)
    sent = models.BooleanField(default=False, verbose_name='Отправлено')
    received = models.BooleanField(default=False, verbose_name='Получено')
    amount = models.PositiveIntegerField('Сумма заказа', default=0)
    payment = models.ForeignKey('yandex_money.Payment', verbose_name='Платеж', default=66)

    class Meta:
        verbose_name = "ЗАКАЗЫ"
        verbose_name_plural = "ЗАКАЗЫ"

    def __str__(self):
        return self.name+" "+self.surname


# товары в заказе
class Order_items(models.Model):
    item = models.ForeignKey(Item)
    order = models.ForeignKey(Order_params, on_delete=models.CASCADE)
    number = models.SmallIntegerField(verbose_name="Количетсво товара", default=1)


#выбранный размер обуви
class Order_size_obuv(models.Model):
    order = models.ForeignKey(Order_params, on_delete=models.CASCADE)
    item = models.ForeignKey(Item)
    size = models.ForeignKey(Size, default=1)




