from django.contrib.admin import AdminSite

class MyAppAdminSite(AdminSite):
    site_header = "MyApp MSSQL Admin"
    site_title  = "MyApp Admin"
    index_title = "MyApp Models"

myapp_admin_site = MyAppAdminSite(name='myapp_admin')
