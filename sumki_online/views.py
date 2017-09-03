# -*- coding: utf-8 -*-
#from django.shortcuts import render
from sumki_online.models import *
from sumki.settings import STATIC_ROOT
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
#from django.contrib.staticfiles.finders import
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
    items_disc = Item.objects.filter(discount__gt=0, number__gt=0).order_by("?")[:4].values()
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
        new_item=True, number__gt=0).exclude(id__in=[value['id'] for value in items_disc]).order_by("?")[:4].values()

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
        hit_sales=True, number__gt=0).exclude(
        id__in=[value['id'] for value in items_disc]).exclude(
        id__in=[value['id'] for value in items_new_offer]).order_by("?")[:4].values()
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
                        '''
                        store_obuv = StoreObuv.objects.get(item=el, size=size_id)
                        store_obuv.number -= int(itemm['number'])
                        if store_obuv.number<0:
                            store_obuv.number = 0
                        store_obuv.save()
                        '''
                    #уменьшаем количество оставшегося товара
                    '''
                    el.number -= int(itemm['number'])
                    if el.number < 0:
                        el.number = 0
                    el.save()
                    '''

                except ObjectDoesNotExist:
                    json_str['result'] = False
                    return HttpResponse(json.dumps(json_str))

            json_str['result'] = True
            json_str['number_order'] = order_par.id
            return HttpResponse(json.dumps(json_str))
    json_str['result'] = False

    return HttpResponse(json.dumps(json_str))

@csrf_exempt
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
            # создаём новый заказ
            payment = Payment(order_amount=round(float((data['amount'])),2), payment_type='')
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
                        '''
                        # уменьшаем количество оставшегося размера
                        store_obuv = StoreObuv.objects.get(item=el, size=size_id)
                        store_obuv.number -= int(itemm['number'])
                        if store_obuv.number < 0:
                            store_obuv.number = 0
                        store_obuv.save()
                        '''
                    '''
                    # уменьшаем количество оставшегося товара
                    el.number -= int(itemm['number'])
                    if el.number < 0:
                        el.number = 0
                    el.save()
                    '''
                except ObjectDoesNotExist:
                    json_str['result'] = False
                    return HttpResponse(json.dumps(json_str))

            context = {
                "payform": payform
            }
            json_str['payform'] = render_to_string('pay_form.html', context)
            json_str['result'] = True
            return HttpResponse(json.dumps(json_str))
    json_str['result'] = False

    return HttpResponse(json.dumps(json_str))


def order(request):
    form = OrderForm()

    context = {
        "form":form,
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

def catalog_sumki(request, alias):
    try:
        #получение данных
        category = Category.objects.get(alias=alias)
        category_a = Category.objects.all().values()
        t_sort = 'popular_sorting'
        w_sort = 'desc'

        items_list = None #список товаров отправляемых пользователю
        #получаем атрибуты обуви
        options = OptionsSumki.objects.all()
        brends_selected = types_selected = special_selected = []
        option_query = {
            'category':category,
            'number__gt':0,
        }
        # если установлены фильтры
        if 'options' in request.GET:
            data = request.GET
            if 'brend_sumki' in data:
                brends_selected = data.get('brend_sumki').split(',')
                option_query['optionssumki__brend__id__in'] = brends_selected
            if 'type_sumki' in data:
                types_selected = data.get('type_sumki').split(',')
                option_query['optionssumki__type__id__in'] = types_selected
            if 'special_sumki' in data:
                special_selected = data.get('special_sumki').split(',')
                if 'hit' in special_selected:
                    option_query['hit_sales'] = True
                if 'disc' in special_selected:
                    option_query['discount__gt'] = 0
                if 'new' in special_selected:
                    option_query['new_item'] = True

            # если установлена сортировка
        if "type_sort" in request.GET and "way_sort" in request.GET:
            t_sort = request.GET.get('type_sort')
            w_sort = request.GET.get('way_sort')
            sign = '-' if w_sort == 'desc' else ''
            if t_sort == 'popular_sorting':
                items_list = Item.objects.filter(**option_query).order_by(sign + "numberviews__number").distinct()
            else:
                items_list = Item.objects.filter(**option_query).order_by(sign + "price").distinct()

        #получаем список товаров
        if not items_list:
            items_list = Item.objects.filter(**option_query).order_by("-numberviews__number").distinct()

        #получаем информацию об обуви на складе
        brends_all = BrendSumki.objects.filter(optionssumki__isnull=False).distinct().values()
        types_all = TypeSumki.objects.filter(optionssumki__isnull=False).distinct().values()
        special_all = {
            'hit': {'name': 'Хит продаж', 'number': 0},
            'disc': {'name': 'Товары со скидкой', 'number': 0},
            'new': {'name': 'Новинки', 'number': 0}
        }

        brends_all = change_key('id', brends_all)
        types_all = change_key('id', types_all)


        for spec in special_selected:
            if spec in special_all:
                special_all[spec]['selected'] = True

        #заполняем атрибуты товаров
        category_a = change_key('id', category_a)

        for itemm in items_list:
            if itemm.hit_sales: special_all['hit']['number']+=1
            if itemm.discount: special_all['disc']['number']+=1
            if itemm.new_item: special_all['new']['number']+=1
            itemm.category_alias = category_a[itemm.category_id]['alias']
            for option in options:
               if option.item_id==itemm.id:
                   if str(option.type.id) in types_selected:
                       types_all[option.type.id]['selected'] = True
                   if str(option.brend.id) in brends_selected:
                       brends_all[option.brend.id]['selected'] = True
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
        {'name':'special','all':special_all,'label':'Статус товара'},
        {'name':'type','all':types_all, 'label':'Тип сумки'},
        {'name':'brend','all':brends_all, 'label':'Бренд сумки'}
    ]

    context = {
        "sort":t_sort+'_'+w_sort,
        "options":options_items,
        "items": items,
        "category": category,
    }

    if "item" in request.GET:
        context.update(get_item(request, alias))

    if request.is_ajax():
        options_items_ajax = {
            "brend_sumki": brends_all,
            "type_sumki": types_all,
            "special_sumki": special_all,
        }
        json_str = json.dumps({
            "sort":t_sort+'_'+w_sort,
            "url_path": request.get_full_path(),
            "paginator":render_to_string('paginator.html', context),
            "items":render_to_string('items.html', context),
            "options":options_items_ajax,
        })
        return HttpResponse(json_str)
    return HttpResponse(render_to_string('catalog.html', context))

def catalog_obuv(request, alias):
    try:
        #получение данных
        category = Category.objects.get(alias=alias)
        category_a = Category.objects.all().values()
        t_sort = 'popular_sorting'
        w_sort = 'desc'

        items_list = None #список товаров отправляемых пользователю
        #получаем атрибуты обуви
        options = OptionsObuv.objects.all()
        sizes_all = Size.objects.filter()
        brends_selected = types_selected = sizes_selected = special_selected = []
        option_query = {
            'category':category,
            'number__gt':0,
        }

        # если установлены фильтры
        if "options" in request.GET:
            #return HttpResponse(request.META['QUERY_STRING'])
            #data = json.loads(request.GET.get('options'))
            data = request.GET
            if 'brend_obuv' in data:
                brends_selected = data.get('brend_obuv').split(',')
                option_query['optionsobuv__brend__id__in'] = brends_selected
            if 'type_obuv' in data:
                types_selected = data.get('type_obuv').split(',')
                option_query['optionsobuv__type__id__in'] = types_selected
            if 'size_obuv' in data:
                sizes_selected = data.get('size_obuv').split(',')
                option_query['storeobuv__size__id__in'] = sizes_selected
            if 'special_obuv' in data:
                special_selected = data.get('special_obuv').split(',')
                if 'hit' in special_selected:
                    option_query['hit_sales'] = True
                if 'disc' in special_selected:
                    option_query['discount__gt'] = 0
                if 'new' in special_selected:
                    option_query['new_item'] = True

        # если установлена сортировка
        if "type_sort" in request.GET and "way_sort" in request.GET:
            t_sort = request.GET.get('type_sort')
            w_sort = request.GET.get('way_sort')
            sign = '-' if w_sort=='desc' else ''
            if t_sort == 'popular_sorting':
                items_list = Item.objects.filter(**option_query).order_by(sign+"numberviews__number").distinct()
            else:
                items_list = Item.objects.filter(**option_query).order_by(sign+"price").distinct()

        #получаем список товаров
        if not items_list:
            items_list = Item.objects.filter(**option_query).order_by("-numberviews__number").distinct()

        #получаем информацию об обуви на складе
        stores = StoreObuv.objects.filter(item__in=items_list)
        sizes_all = Size.objects.filter(storeobuv__isnull=False).distinct().values()
        brends_all = BrendObuv.objects.filter(optionsobuv__isnull=False).distinct().values()
        types_all = TypeObuv.objects.filter(optionsobuv__isnull=False).distinct().values()
        special_all = {
                           'hit':{'name':'Хит продаж', 'number':0},
                           'disc':{'name':'Товары со скидкой', 'number':0},
                           'new':{'name':'Новинки', 'number':0}
                       }

        sizes_all = change_key('id', sizes_all)
        brends_all = change_key('id', brends_all)
        types_all = change_key('id', types_all)

        for spec in special_selected:
            if spec in special_all:
                special_all[spec]['selected'] = True

        #заполняем список размеров
        for store in stores:
            if str(store.size.id) in sizes_selected:
                sizes_all[store.size.id]['selected'] = True
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
            if itemm.hit_sales: special_all['hit']['number']+=1
            if itemm.discount: special_all['disc']['number']+=1
            if itemm.new_item: special_all['new']['number']+=1
            itemm.category_alias = category_a[itemm.category_id]['alias']
            for option in options:
               if option.item_id==itemm.id:
                   if str(option.type.id) in types_selected:
                       types_all[option.type.id]['selected'] = True
                   if str(option.brend.id) in brends_selected:
                       brends_all[option.brend.id]['selected'] = True
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
        {'name':'special','all':special_all,'label':'Статус товара'},
        {'name':'type','all':types_all, 'label':'Тип обуви'},
        {'name':'size','all':sizes_all, 'label':'Размер обуви'},
        {'name':'brend','all':brends_all, 'label':'Бренд обуви'}
    ]
    context = {
        "sort":t_sort+'_'+w_sort,
        "options":options_items,
        "items": items,
        "category": category,
    }

    if "item" in request.GET:
        context.update(get_item(request, alias))

    if request.is_ajax():
        options_items_ajax = {
            "brend_obuv": brends_all,
            "type_obuv": types_all,
            "size_obuv": sizes_all,
            "special_obuv": special_all,
        }
        json_str = json.dumps({
            "sort":t_sort+'_'+w_sort,
            "url_path":request.get_full_path(),
            "paginator":render_to_string('paginator.html', context),
            "items":render_to_string('items.html', context),
            "options":options_items_ajax,
        })
        return HttpResponse(json_str)
    return HttpResponse(render_to_string('catalog.html', context))

def get_item(request,alias):
    context = {
        'show_more_window':True,
    }
    elem_id = request.GET.get('item')
    if alias == 'obuv':
        context['store_elem'] = StoreObuv.objects.filter(item=elem_id)
        options_elem = OptionsObuv.objects.get(item=elem_id)
    elif alias == 'sumki':
        options_elem = OptionsSumki.objects.get(item=elem_id)
    else: return {}
    context['elem'] = Item.objects.get(pk=elem_id)
    context['options_elem'] = options_elem
    context['options_elem_render'] = render_to_string('options_elem.html', {'options':options_elem, 'category': alias})
    context['images'] = []
    for i in range(1,4):
        path_var = STATIC_ROOT+"sumki_online/images/"+alias+"/400_on_400/"+str(elem_id)+"v"+str(i)+".jpg"
        if os.path.exists(path_var):
            context['images'].append("1")
    return context

def catalog(request, alias='obuv'):
    if "item" in request.GET and request.is_ajax():
        elem_id = request.GET.get('item')
        context = {
            'category':Category.objects.get(alias=alias)
        }
        if alias == 'obuv':
            options_elem = OptionsObuv.objects.get(item=elem_id)
            context['store_elem'] = StoreObuv.objects.filter(item=elem_id)
        elif alias == 'sumki':
            options_elem = OptionsSumki.objects.get(item=elem_id)
        else: return Http404

        context['elem'] = Item.objects.get(pk=elem_id)
        context['options_elem'] = options_elem
        context['images'] = []
        context['show_more_window'] = True
        context['options_elem_render'] = render_to_string('options_elem.html', {'options':options_elem, 'category': alias})
        for i in range(1,4):
            path_var = STATIC_ROOT+"sumki_online/images/"+alias+"/400_on_400/"+str(elem_id)+"v"+str(i)+".jpg"
            if os.path.exists(path_var):
                context['images'].append("1")
        json_str = json.dumps({
            "more_info_win": render_to_string('more_inform_window.html', context),
            "url_path": request.get_full_path(),
        })
        return HttpResponse(json_str)
    if alias == 'obuv':
        return catalog_obuv(request, alias)
    elif alias == 'sumki':
        return  catalog_sumki(request, alias)
    elif alias == 'accessories':
        return catalog_accessories(request, alias)

