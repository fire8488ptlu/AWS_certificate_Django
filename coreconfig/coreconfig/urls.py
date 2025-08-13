
from django.contrib import admin
from django.urls import path, include
from django.urls import re_path

from myapp.admin_site import myapp_admin_site
from myapp.APIView_QuestionHeader import *
from myapp.APIView_Component import *
from myapp.views import CustomTokenObtainPairView
from myapp.views import frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    ## -----------------------------
    path('myapp-admin/',   myapp_admin_site.urls),   
    #path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # optional
    path('api/token/',  CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # login
    path('api/question-headershowAll/', QuestionHeaderShowAll.as_view()),
    path('api/question-headerInsert/', QuestionHeaderInsert.as_view()),
    path('api/question-convert/', QuestionConverter.as_view()),

    path('api/C/tagHeaderShowAll/', TagHeaderShowAll.as_view()),
    path('api/C/CertifiedShowAll/', CertifiedShowAll.as_view()),
    path('api/questionRecord/', QuestionRecord.as_view()),
    path('api/questionStatus/', QuestionStatus.as_view()),
    re_path(r'^(?!api/|admin/|myapp-admin/).*$' , frontend),  # 🔥 Catch-all except APIs and admin
]
