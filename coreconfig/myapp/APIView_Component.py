from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

import json
import os
from datetime import datetime
import re


class TagHeaderShowAll(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
            SELECT *
            FROM TagHeader
            """)
            tag_columns = [col[0] for col in cursor.description]
            tag_rows = cursor.fetchall()
            tag_data = [dict(zip(tag_columns, row)) for row in tag_rows]
           

        return Response({"tagheader":tag_data})


class CertifiedShowAll(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT *
                FROM Certified
            """)
            tag_columns = [col[0] for col in cursor.description]
            tag_rows = cursor.fetchall()
            tag_data = [dict(zip(tag_columns, row)) for row in tag_rows]
           

        return Response({"Certified":tag_data})

