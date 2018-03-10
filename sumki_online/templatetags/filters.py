from django import template

register = template.Library()

@register.filter
def price_format(value, separator=u' '):
    value = str(value)
    if len(value) <= 3:
        return value
    parts = []
    while value:
        parts.append(value[-3:])
        value = value[:-3]
    parts.reverse()
    return separator.join(parts)

@register.filter
def ost_del(value, arg):
    try:
        value = int(value)
        arg = int(arg)
        if arg: return value % arg
    except:
        pass
    return 'no'

@register.filter
def smart_ending(number, forms):
    number_el = str(number)
    rest = number % 10
    if number >= 100:
        number %= 100
    if rest==1 and number != 11: return number_el+' '+forms[0]
    elif (rest in (2,3,4)) and (number not in (12,13,14)): return number_el+' '+forms[1]
    else: return number_el+' '+forms[2]

@register.filter
def discount(value, disc):
    new_value = int(value)*(1-int(disc)/100)
    return int(new_value)

@register.filter
def saving(value, disc):
    new_value = int(value) * (1 - int(disc) / 100)
    save = int(value) - int(new_value)
    return int(save)

@register.filter(name='addcss')
def addcss(value, arg):
    pass
    '''
    css_classes = value.field.widget.attrs.get('class', None).split(' ')
    if css_classes and arg not in css_classes:
        css_classes = '%s %s' % (css_classes, arg)
    return value.as_widget(attrs={'class': css_classes})
    '''