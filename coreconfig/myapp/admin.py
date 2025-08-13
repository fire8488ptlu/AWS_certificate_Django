from . import models
from .admin_site import myapp_admin_site
from django.contrib import admin
from .models import Questionheader ,Questiontag
from django.utils.translation import gettext_lazy as _
from .forms import QuestionheaderSearchForm


class QHIDRangeFilter(admin.SimpleListFilter):
    title = _('QHID Range')
    parameter_name = 'qhid_range'

    def lookups(self, request, model_admin):
        return [
            ('lt100', _('QHID < 100')),
            ('gte100', _('QHID ≥ 100')),
        ]

    def queryset(self, request, queryset):
        if self.value() == 'lt100':
            return queryset.filter(qhid__lt=100)
        elif self.value() == 'gte100':
            return queryset.filter(qhid__gte=100)

# Register Questionheader with custom admin config
class QuestionheaderAdmin(admin.ModelAdmin):
    list_display = ('qhid', 'qhtitle', 'qhmultiple', 'iscorrect', 'istag', 'isdone')
    list_filter = ('qhmultiple', 'iscorrect', 'istag', 'isdone')
    search_fields = ['qhid']  # ✅ Add search by QHID and Title

    def get_search_results(self, request, queryset, search_term):
        if search_term.strip() == "":
            return queryset, False  # No filtering, return all
            
        try:
            # Try converting input to int for exact QHID match
            search_qhid = int(search_term)
            queryset = queryset.filter(qhid=search_qhid)
            return queryset, False
        except ValueError:
            # If not an int, return no results
            return queryset.none(), False

myapp_admin_site.register(Questionheader, QuestionheaderAdmin)


# # Register Questionheader with custom admin config
class QuestiontagAdmin(admin.ModelAdmin):
    list_display = ('qtagid', 'thid', 'qhid_title')
    list_filter = ('thid',)

    def qhid_title(self, obj):
        return obj.qhid.qhtitle[:100] if obj.qhid and obj.qhid.qhtitle else ""
    qhid_title.short_description = 'Question Title'

myapp_admin_site.register(Questiontag, QuestiontagAdmin)

for name in dir(models):
    model = getattr(models, name)
    if isinstance(model, type) and (model != Questionheader or model != Questiontag):
        try:
            myapp_admin_site.register(model)
        except:
            pass
