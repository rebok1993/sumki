"""sumki URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.views.generic.base import TemplateView
from django.contrib import admin

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^fail-payment/$', TemplateView.as_view(template_name='fail.html'), name='payment_fail'),
	url(r'^success-payment/$', TemplateView.as_view(template_name='success.html'), name='payment_success'),
    url(r'^delivery/$', TemplateView.as_view(template_name='delivery.html'), name='delivery'),
    url(r'^about/$', TemplateView.as_view(template_name='about.html'), name='about'),
	url(r'^yandex-money/', include('yandex_money.urls')),
    url(r'^', include("sumki_online.urls")),
]
