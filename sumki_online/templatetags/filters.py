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