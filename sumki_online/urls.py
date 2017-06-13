from django.conf.urls import url

from . import views


app_name = 'sumki_online'
urlpatterns = [
    # ex: /polls/
    url(r'^$', views.home, name='home'),
    url(r'^(?P<category>[a-z0-9]+)/item/(?P<number>[0-9]+)/$', views.item, name='item'),
    url(r'^catalog/(?P<alias>[^/]+)/$', views.catalog, name='catalog'),
    url(r'^catalog/$', views.catalog, name='all_catalog'),
    url(r'^order/$', views.order, name='order'),
    url(r'^order/success$', views.order_success, name='order_success'),
    url(r'^order/fail$', views.order_fail, name='order_fail'),
    url(r'^checkout/$', views.checkout, name='checkout'),
    url(r'^getOptionsAjax/(?P<elem>[^/]+)/$', views.get_options_ajax, name='getopt'),
    url(r'^addNumberViews/(?P<elem>[^/]+)/$', views.add_number_views),
    #url(r'^(?  P<alias>[^/]+)', views.get_category, name='category'),
    # ex: /polls/5/
    #url(r'^(?P<question_id>[0-9]+)/$', views.detail, name='detail'),
    # ex: /polls/5/results/
]
