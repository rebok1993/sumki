# -*- coding: utf-8 -*-
from django.contrib import admin
from django.contrib.admin import AdminSite
from sumki_online.models import *
from django.conf.urls import url
from django.contrib.admin import helpers, widgets
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.template.loader import render_to_string
from django.template.response import TemplateResponse
# Register your models here.

'''
def get_number_catalog(request):
    if request.is_ajax():
        data = request.GET.get('category')
        if data==1:
            return [OptionObuvInline,StoreObuvInline]
    return []
'''
'''
class GetNumberCategory(admin.ModelAdmin):
    def get_urls(self):
        urls = super().get_urls()

        my_urls = [
            url(r'^(.+)/my_view/$', self.my_view)
        ]
        return my_urls + urls

    def my_view(self, request):
        return HttpResponse("Тута")
'''

class OptionObuvInline(admin.TabularInline):
    model = OptionsObuv
    extra = 1
    max_num = 1


class OptionSumkiInline(admin.TabularInline):
    model = OptionsSumki
    extra = 1
    max_num = 1

class StoreObuvInline(admin.TabularInline):
    model = StoreObuv
    extra = 1

class MainOfferAdmin(admin.ModelAdmin):
    list_display = ('image', 'color', 'link')
    list_editable = ('color',)

class ItemAdmin(admin.ModelAdmin):
    class Media:
        js = (
            "js/jquery-3.1.1.js",
            "js/my_admin.js",
        )

    list_display = ('id', 'name', 'price', 'image', 'number', 'discount','category_id')
    list_editable = ('price', 'image', 'discount', 'number')

    def get_urls(self):
        urls = super(ItemAdmin, self).get_urls()
        my_urls = [
            url(r'^my_view/$', self.get_form),
        ]
        return my_urls + urls


    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            kwargs['fields'] = ['category',]
            if request.GET.get("category") == "1":
                kwargs['fields'] = ['category', 'name', 'price', 'image', 'discount','description','data']
                self.inlines = [
                    OptionObuvInline,
                    StoreObuvInline
                ]
            if request.GET.get("category") == "2":
                kwargs['fields'] = ['category', 'name', 'price', 'image', 'discount','description','data']
                self.inlines = [
                    OptionSumkiInline,
                ]
        else:
            if obj.category_id == 1:
                self.inlines = [
                    OptionObuvInline,
                    StoreObuvInline
                ]

            if obj.category_id == 2:
                self.inlines = [
                    OptionSumkiInline,
                ]
            '''
        if request.is_ajax():
            kwargs['fields'] = ['name', 'price', 'image', 'discount']
            form =  super().get_form(request, obj, **kwargs)

            context = dict(
                self.admin_site.each_context(request),
                form=form
            )
            return TemplateResponse(request, "nee.html", context)
        '''
        return super().get_form(request, obj, **kwargs)

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

class OptionsObuvAdmin(admin.ModelAdmin):
    list_display = ('id', 'item', 'brend')

class StoreObuvAdmin(admin.ModelAdmin):
    list_display = ('id', 'item', 'size', 'number')
    list_editable = ('number',)

class OrderParamAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'surname', 'adress', 'data', 'sent', 'received')
    list_editable = ('sent','received')

class OrderItemsAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_item', 'get_order', 'number', 'get_name','get_surname','get_adress','get_data')


    def get_order(self, obj):
        return obj.order.id
    def get_item(self, obj):
        if obj.item.category.alias == 'obuv':
            size = Size.objects.filter(order_size_obuv__item=obj.item, order_size_obuv__order=obj.order.id).values()
            final_str = " "
            for i in size:
                final_str += str(i['name'])+" "

            return OptionsObuv.objects.get(item=obj.item).type.name+" размеры:" + final_str
        elif obj.item.category.alias == 'sumki':
            return OptionsSumki.objects.get(item=obj.item).type.name
        return "прочие"
    def get_name(self, obj):
        return obj.order.name
    def get_surname(self, obj):
        return obj.order.surname
    def get_adress(self, obj):
        return obj.order.adress
    def get_data(self, obj):
        return obj.order.data

    get_item.short_description = 'Тип товара'
    get_name.short_description = 'Имя'
    get_surname.short_description = 'Фамилия'
    get_adress.short_description = 'Адресс'
    get_data.short_description = 'Дата'
    get_order.short_description = 'Номер заказа'

class BrendObuvAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

class OrderOptObuv(admin.ModelAdmin):
    list_display = ('id', 'order', 'item', 'size')

admin.site.register(
    (MaterialInternal,Season,MaterialInsole,
     MaterialSole,TopMaterial,TypeSumki,
     TypeObuv,BrendSumki,Size, NumberViews, MaterialSumki, WidthSumki, HeightSumki, DepthSumki))

admin.site.register(BrendObuv, BrendObuvAdmin)
admin.site.register(OptionsObuv, OptionsObuvAdmin)
admin.site.register(Item, ItemAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(StoreObuv, StoreObuvAdmin)
admin.site.register(MainOffer, MainOfferAdmin)
admin.site.register(Order_params, OrderParamAdmin)
admin.site.register(Order_items, OrderItemsAdmin)
admin.site.register(Order_size_obuv, OrderOptObuv)
