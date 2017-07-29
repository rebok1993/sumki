# -*- coding: utf-8 -*-
#from django.shortcuts import render
from sumki_online.models import *
from django.http import HttpResponseRedirect, HttpResponse, Http404
#from django.core.exceptions import ObjectDoesNotExist
from django.template.loader import render_to_string
#from django.shortcuts import render
#from django.core.context_processors import csrf
#from django.views.decorators.csrf import csrf_exempt
#from datetime import *
from django.views.decorators.cache import cache_control
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
#import http.cookies
import json
from django.views.generic import TemplateView
from yandex_money.forms import PaymentForm
from yandex_money.models import Payment
import re
import os
#import random
#import string

class OrderPage(TemplateView):
    template_name = 'order_page.html'

    def get_context_data(self, **kwargs):
        payment = Payment(order_amount=90.72)
        payment.save()
        order_par = Order_params(name='Ivan',surname='Базин',adress='Нижний Новгород', amount=300.75, payment=payment)
        order_par.save()
        ctx = super(OrderPage, self).get_context_data(**kwargs)
        ctx['form'] = PaymentForm(instance=payment)
        return ctx

@cache_control(must_revalidate=0)
def home(request):
    category = {}
    categories =  Category.objects.all().values()
    options_sumki = OptionsSumki.objects.all()
    options_obuv = OptionsObuv.objects.all()
    for cat in categories:
        category[cat['id']] = cat
    #товары со скидками
    items_disc = Item.objects.filter(discount__gt=0).order_by("?")[:4].values()
    for itemm in items_disc:
        for option in options_sumki:
            if option.item_id == itemm['id']:
                itemm['brend'] = option.brend.name
                itemm['type'] = option.type.name
        for option in options_obuv:
            if option.item_id == itemm['id']:
                itemm['brend'] = option.brend.name
                itemm['type'] = option.type.name
        itemm['category_alias'] = category[itemm['category_id']]['alias']
    #новые товары
    #items_new_offer = Item.objects.exclude(id__in=[value['id'] for value in items_disc]).order_by("-data")[:4].values()
    items_new_offer = Item.objects.filter(
        new_item=True).exclude(id__in=[value['id'] for value in items_disc])[:4].values()

    for itemm in items_new_offer:
        for option in options_sumki:
            if option.item_id == itemm['id']:
                itemm['brend'] = option.brend.name
                itemm['type'] = option.type.name
        for option in options_obuv:
            if option.item_id == itemm['id']:
                itemm['brend'] = option.brend.name
                itemm['type'] = option.type.name
        itemm['category_alias'] = category[itemm['category_id']]['alias']
    # товары с наибольшими просмотрами
    '''
    items_hits = Item.objects.filter(
        numberviews__number__isnull=False).exclude(
        id__in=[value['id'] for value in items_disc]).exclude(
        id__in=[value['id'] for value in items_new_offer]).order_by(
        "-numberviews__number")[:4].values()'''
    items_hits = Item.objects.filter(
        hit_sales=True).exclude(
        id__in=[value['id'] for value in items_disc]).exclude(
        id__in=[value['id'] for value in items_new_offer])[:4].values()
    for itemm in items_hits:
        for option in options_sumki:
            if option.item_id == itemm['id']:
                itemm['brend'] = option.brend.name
                itemm['type'] = option.type.name
        for option in options_obuv:
            if option.item_id == itemm['id']:
                itemm['brend'] = option.brend.name
                itemm['type'] = option.type.name
        itemm['category_alias'] = category[itemm['category_id']]['alias']


    main_offer = MainOffer.objects.all()
    items_common = []
    items_common.extend([value['id'] for value in items_disc])
    items_common.extend([value['id'] for value in items_new_offer])
    items_common.extend([value['id'] for value in items_hits])

    #получаем данные со склада обуви
    stores = StoreObuv.objects.filter(item__in=items_common)

    for store in stores:
        for itemm in items_disc:
            if itemm['id'] == store.item_id:
                if not "size" in itemm:
                    itemm['size'] = [store.size.name]
                else:
                    itemm['size'].append(store.size.name)
        for itemm in items_new_offer:
            if itemm['id'] == store.item_id:
                if not "size" in itemm:
                    itemm['size'] = [store.size.name]
                else:
                    itemm['size'].append(store.size.name)
        for itemm in items_hits:
            if itemm['id'] == store.item_id:
                if not "size" in itemm:
                    itemm['size'] = [store.size.name]
                else:
                    itemm['size'].append(store.size.name)
    context = {
        "sitename": "Магазин сумок",
        "items_disc": items_disc,
        "items_new_offer": items_new_offer,
        "items_hits": items_hits,
        "main_offer":main_offer
    }
    return HttpResponse(render_to_string('index.html', context))

def item(request,category, number):
    tovar = Item.objects.get(pk=number)
    number_view = NumberViews.objects.filter(item=tovar)
    category = Category.objects.get(alias=category)
    if number_view:
        number_view[0].number += 1
        number_view[0].save()
    else:
        number_v = NumberViews(item=tovar, number=1, data=datetime.today())
        number_v.save()


    context = {
        "title": "Helloworld",
        "item": tovar,
        "category": category,
    }
    return HttpResponse(render_to_string('item.html', context))

#количество просмотров
def add_number_views(request, elem):
    if request.is_ajax():
        tovar = Item.objects.get(pk=elem)
        number_view = NumberViews.objects.filter(item=tovar)
        if number_view:
            number_view[0].number += 1
            number_view[0].save()
        else:
            number_v = NumberViews(item=tovar, number=1, data=datetime.today())
            number_v.save()

@csrf_exempt
def checkout(request):
    json_str = {}
    #return HttpResponse(json.dumps(["Тута"]))
    if request.is_ajax() and request.method == 'POST':
        data_json = request.POST.get('order')

        if not data_json:
            json_str['result'] = False
            return HttpResponse(json.dumps(json_str))

        data = json.loads(request.POST.get('order'))
        form = OrderForm(data)
        if form.is_valid():
            #создаём новый заказ
            adress = form.cleaned_data['city']+" "+form.cleaned_data['adress']
            order_par = Order_params(
                name=form.cleaned_data['name'],
                surname=form.cleaned_data['surname'],
                adress=adress,
                data=datetime.today()
            )
            order_par.save() #создали номер заказа

            #добавляем товары в заказ
            for itemm in data['items']:
                try:
                    el = Item.objects.get(pk=itemm['id'])
                    order_items = Order_items(
                        item=el,
                        order=order_par,
                        number=int(itemm['number'])
                    )
                    order_items.save()#указали какие товары в заказе

                    #если обувь то добавляем информацию по размерам
                    if itemm.get('size', False):
                        size_id = Size.objects.get(name=itemm['size'])
                        if StoreObuv.objects.filter(item=el, size=size_id).exists():
                            if not Order_size_obuv.objects.filter(order=order_par, item=el, size=size_id).exists():
                                order_size = Order_size_obuv(
                                    order=order_par,
                                    item=el,
                                    size=size_id
                                )
                                order_size.save()
                        #уменьшаем количество оставшегося размера
                        store_obuv = StoreObuv.objects.get(item=el, size=size_id)
                        store_obuv.number -= int(itemm['number'])
                        if store_obuv.number<0:
                            store_obuv.number = 0
                        store_obuv.save()
                    #уменьшаем количество оставшегося товара
                    el.number -= int(itemm['number'])
                    if el.number < 0:
                        el.number = 0
                    el.save()

                except ObjectDoesNotExist:
                    json_str['result'] = False
                    return HttpResponse(json.dumps(json_str))

            json_str['result'] = True
            json_str['number_order'] = order_par.id
            return HttpResponse(json.dumps(json_str))
    json_str['result'] = False

    return HttpResponse(json.dumps(json_str))


def order_ready(request):
    json_str = {}

    if request.is_ajax() and request.method == 'POST':
        data_json = request.POST.get('order')

        if not data_json:
            json_str['result'] = False
            return HttpResponse(json.dumps(json_str))

        data = json.loads(request.POST.get('order'))
        form = OrderForm(data)
        if form.is_valid():
            #return HttpResponse(json.dumps(["Тута"]));
            # создаём новый заказ
            payment = Payment(order_amount=90.70, payment_type='')
            payment.save()
            payform = PaymentForm(instance=payment)
            adress = form.cleaned_data['city'] + " " + form.cleaned_data['adress']

            order_par = Order_params(
                name=form.cleaned_data['name'],
                surname=form.cleaned_data['surname'],
                adress=adress,
                amount=data['amount'],
                payment=payment,
                data=datetime.today()
            )
            order_par.save()  # создали номер заказа

            # добавляем товары в заказ
            for itemm in data['items']:
                try:
                    el = Item.objects.get(pk=itemm['id'])
                    order_items = Order_items(
                        item=el,
                        order=order_par,
                        number=int(itemm['number'])
                    )
                    order_items.save()  # указали какие товары в заказе

                    # если обувь то добавляем информацию по размерам
                    if itemm.get('size', False):
                        size_id = Size.objects.get(name=itemm['size'])
                        if StoreObuv.objects.filter(item=el, size=size_id).exists():
                            if not Order_size_obuv.objects.filter(order=order_par, item=el, size=size_id).exists():
                                order_size = Order_size_obuv(
                                    order=order_par,
                                    item=el,
                                    size=size_id
                                )
                                order_size.save()
                        # уменьшаем количество оставшегося размера
                        store_obuv = StoreObuv.objects.get(item=el, size=size_id)
                        store_obuv.number -= int(itemm['number'])
                        if store_obuv.number < 0:
                            store_obuv.number = 0
                        store_obuv.save()
                    # уменьшаем количество оставшегося товара
                    el.number -= int(itemm['number'])
                    if el.number < 0:
                        el.number = 0
                    el.save()

                except ObjectDoesNotExist:
                    json_str['result'] = False
                    return HttpResponse(json.dumps(json_str))

            context = {
                "payform": payform
            }
            json_str['payform'] = render_to_string('pay_form.html', context)
            json_str['result'] = True
            json_str['number_order'] = order_par.id
            return HttpResponse(json.dumps(json_str))
    json_str['result'] = False

    return HttpResponse(json.dumps(json_str))


def order(request):
    form = OrderForm()
    payment = Payment(order_amount=90.70, payment_type='')
    payment.save()
    payform = PaymentForm(instance=payment)
    context = {
        "form":form,
        "payform": payform
    }
    return HttpResponse(render_to_string('order.html',context))

def order_success(request):
    context = {

    }
    return HttpResponse(render_to_string('order_success.html', context))

def order_fail(request):
    context = {

    }
    return HttpResponse(render_to_string('order_fail.html', context))

def catalog_sumki(request, alias):
    context= {

    }
    return HttpResponse(render_to_string('warning.html', context))
    try:
        brends = {}
        types = {}
        options_items = {}
        items_list = None
        options = OptionsSumki.objects.all()
        category = Category.objects.get(alias=alias)
        category_a = Category.objects.all().values()
        categoryies = {}

        option_query = {
            'category':category,
            'number__gt':0,
        }
        if request.is_ajax():
            data_json = request.GET.get('options')
            data_json_sort = request.GET.get('sort')
            if data_json:
                data = json.loads(request.GET.get('options'))
                if data['brend_sumki']:
                    option_query['optionssumki__brend__name__in'] = [value for value in data['brend_sumki']]
                if data['type_sumki']:
                    option_query['optionssumki__type__name__in'] = [value for value in data['type_sumki']]

            if data_json_sort:
                data = json.loads(request.GET.get('sort'))
                if data['type_sort'] == 'popular':
                    if data['way_sort'] == 'desc':
                        items_list = Item.objects.filter(**option_query).order_by("-numberviews__number")
                    else:
                        items_list = Item.objects.filter(**option_query).order_by("numberviews__number")
                else:
                    if data['way_sort'] == 'desc':
                        items_list = Item.objects.filter(**option_query).order_by("-price")
                    else:
                        items_list = Item.objects.filter(**option_query).order_by("price")

        # получаем список товаров
        if not items_list:
            items_list = Item.objects.filter(**option_query).order_by("-numberviews__number")
        brends_all = BrendSumki.objects.filter(optionssumki__isnull=False).distinct().values()
        types_all = TypeSumki.objects.filter(optionssumki__isnull=False).distinct().values()
        for cat in category_a:
            categoryies[cat['id']] = cat

        for itemm in items_list:
            itemm.category_alias = categoryies[itemm.category_id]['alias']
            for option in options:
               if option.item_id==itemm.id:
                   #добавляем атрибуты обуви
                   types[option.type.name] = types[option.type.name] + 1 if option.type.name in types else 1
                   brends[option.brend.name] = brends[option.brend.name] + 1 if option.brend.name in brends else 1

                   # добавляем атрибут бренда к элементу
                   if not hasattr(itemm, "brend"): itemm.brend = option.brend.name
                   # добавляем атрибут типа к элементу
                   if not hasattr(itemm, "type"): itemm.type = option.type.name
        paginator = Paginator(items_list, 12)
        page = request.GET.get('page')
        items = paginator.page(page)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)

    options_items['brend'] = {'all': brends_all, 'elements': brends, 'label': 'Бренд сумки'}
    options_items['type'] = {'all': types_all, 'elements': types, 'label': 'Тип сумки'}

    context = {
        "options":options_items,
        "items": items,
        "category": category,
    }
    if request.is_ajax():
        options_items_ajax = {
            "brend_sumki": brends,
            "type_sumki": types,
        }
        json_str = json.dumps({
            "options":options_items_ajax,
            "paginator":render_to_string('paginator.html', context),
            "items":render_to_string('items.html', context),
        })
        return HttpResponse(json_str)
    return HttpResponse(render_to_string('catalog.html',context))

def catalog_accessories(request,alias):
    try:
        category = Category.objects.get(alias=alias)
        option_query = {
            'category':category,
        }
        # получаем список товаров
        items_list = Item.objects.filter(**option_query).distinct()
        paginator = Paginator(items_list, 12)
        page = request.GET.get('page')
        items = paginator.page(page)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)

    context = {
        "items": items,
        "category": category,
    }
    return HttpResponse(render_to_string('catalog.html',context))

def change_key(key, array):
    new_array = {}
    for elem_array in array:
        new_array[elem_array[key]] = elem_array
    return new_array

def catalog_obuv(request, alias):
    try:
        #получение данных
        category = Category.objects.get(alias=alias)
        category_a = Category.objects.all().values()

        items_list = None #список товаров отправляемых пользователю
        #получаем атрибуты обуви
        options = OptionsObuv.objects.all()
        sizes_all = Size.objects.filter()

        option_query = {
            'category':category,
            'storeobuv__number__gt':0,
        }
        #если запрос ajax заполняем выбранные в фильтре атрибуты
        if request.is_ajax():
            data_json = request.GET.get('options')
            data_json_sort = request.GET.get('sort')
            #если установлены фильтры
            if data_json:
                data = json.loads(request.GET.get('options'))
                if data['brend_obuv']:
                    option_query['optionsobuv__brend__name__in'] = [data['brend_obuv'][key] for key in data['brend_obuv']]
                if data['type_obuv']:
                    option_query['optionsobuv__type__name__in'] = [data['type_obuv'][key] for key in data['type_obuv']]
                if data['size_obuv']:
                    option_query['storeobuv__size__name__in'] = [data['size_obuv'][key] for key in data['size_obuv']]
                if 'hit' in data['special_obuv']:
                    option_query['hit_sales'] = True
                if 'disc' in data['special_obuv']:
                    option_query['discount__gt'] = 0
                if 'new' in data['special_obuv']:
                    option_query['new_item'] = True

            #если установлена сортировка
            if data_json_sort:
                data_sort = json.loads(request.GET.get('sort'))
                if data_sort['type_sort'] == 'popular':
                    if data_sort['way_sort'] == 'desc':
                        items_list = Item.objects.filter(**option_query).order_by("-numberviews__number").distinct()
                    else:
                        items_list = Item.objects.filter(**option_query).order_by("numberviews__number").distinct()
                else:
                    if data_sort['way_sort'] == 'desc':
                        items_list = Item.objects.filter(**option_query).order_by("-price").distinct()
                    else:
                        items_list = Item.objects.filter(**option_query).order_by("price").distinct()

        #получаем список товаров
        if not items_list:
            items_list = Item.objects.filter(**option_query).order_by("-numberviews__number").distinct()

        #получаем информацию об обуви на складе
        stores = StoreObuv.objects.filter(item__in=items_list)
        sizes_all = Size.objects.filter(storeobuv__isnull=False).distinct().values()
        brends_all = BrendObuv.objects.filter(optionsobuv__isnull=False).distinct().values()
        types_all = TypeObuv.objects.filter(optionsobuv__isnull=False).distinct().values()

        number_hits = 0
        number_disc = 0
        number_new = 0
        sizes_all = change_key('id', sizes_all)
        brends_all = change_key('id', brends_all)
        types_all = change_key('id', types_all)


        #заполняем список размеров
        for store in stores:
            sizes_all[store.size.id]['number'] = sizes_all[store.size.id]['number'] + 1 if 'number' in sizes_all[store.size.id] else 1
            for itemm in items_list:
                if itemm.id==store.item_id:
                    if not hasattr(itemm, "size"):
                        itemm.size = [store.size.name]
                    else:
                        itemm.size.append(store.size.name)
        #заполняем атрибуты товаров

        category_a = change_key('id', category_a)

        for itemm in items_list:
            if itemm.hit_sales: number_hits+=1
            if itemm.discount: number_disc+=1
            if itemm.new_item: number_new+=1
            itemm.category_alias = category_a[itemm.category_id]['alias']
            for option in options:
               if option.item_id==itemm.id:
                   #добавляем атрибуты обуви
                   types_all[option.type.id]['number'] = types_all[option.type.id]['number'] + 1 if 'number' in types_all[option.type.id] else 1
                   brends_all[option.brend.id]['number'] = brends_all[option.brend.id]['number'] + 1 if 'number' in brends_all[option.brend.id] else 1

                   # добавляем атрибут бренда к элементу
                   if not hasattr(itemm, "brend"): itemm.brend = option.brend.name
                   # добавляем атрибут типа к элементу
                   if not hasattr(itemm, "type"): itemm.type = option.type.name
        paginator = Paginator(items_list, 12)
        page = request.GET.get('page')
        items = paginator.page(page)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)

    options_items = [
        {'name':'special',
                   'all':
                       {
                           'hit':{'name':'Хит продаж', 'number':number_hits},
                           'disc':{'name':'Товары со скидкой','number':number_disc},
                           'new':{'name':'Новинки','number':number_new}
                       },
                    'label':'Статус товара'},
        {'name':'type','all':types_all, 'label':'Тип обуви'},
        {'name':'size','all':sizes_all, 'label':'Размер обуви'},
        {'name':'brend','all':brends_all, 'label':'Бренд обуви'}
    ]

    context = {
        "options":options_items,
        "items": items,
        "category": category,
    }

    if request.is_ajax():
        options_items_ajax = {
            "brend_obuv": brends_all,
            "type_obuv": types_all,
            "size_obuv": sizes_all,
            "special_obuv": {
                'hit':{'name':'Хит продаж', 'number':number_hits},
                'disc':{'name':'Товары со скидкой','number':number_disc},
                'new':{'name':'Новинки','number':number_new}
            },
        }
        json_str = json.dumps({
            "paginator":render_to_string('paginator.html', context),
            "items":render_to_string('items.html', context),
            "options":options_items_ajax,
        })
        return HttpResponse(json_str)
    return HttpResponse(render_to_string('catalog.html', context))

def catalog(request, alias='obuv'):
    if alias == 'obuv':
        return catalog_obuv(request, alias)
    elif alias == 'sumki':
        return  catalog_sumki(request, alias)
    elif alias == 'accessories':
        return catalog_accessories(request, alias)

def get_options_ajax(request, elem='1'):
    options = OptionsObuv.objects.get(item=elem)
    context = {
        "options": options,
    }
    return HttpResponse(render_to_string('options_elem.html', context))
