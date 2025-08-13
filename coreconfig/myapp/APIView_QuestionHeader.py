from django.db import connection
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import io
import json
import os
from datetime import datetime
import re

import pyodbc
from bs4 import BeautifulSoup
import random
 
class QuestionHeaderShowAll(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    WITH S1 AS (
                        SELECT 
                            QH.*,
                            QC.QCID,
                            QC.QCTitle,
                            QC.IsCorrect AS QCIsCorrect
                        FROM QuestionHeader AS QH
                        LEFT JOIN QuestionChoose AS QC ON QH.QHID = QC.QHID
                        WHERE QCID is NOT NULL
                    ),S2 AS (
                        SELECT 
                            QHID,
                            MAX(QHTitle) AS QHTitle,
                            MAX(CAST(QHMultiple AS INT)) AS QHMultiple,
                            MAX(Explain) AS Explain,
                            MAX(CAST(IsDone AS INT)) AS IsDone,
                            MAX(CAST(IsCorrect AS INT)) AS IsCorrect,
                            MAX(CAST(IsTag AS INT)) AS IsTag,
                            MAX(CreDateTime) AS CreDateTime,
                            MAX(UpdDateTime) AS UpdDateTime,
                            STRING_AGG(
                                CONCAT('{QCID:', QCID,',QCTitle:"',QCTitle,'",QCIsCorrect:',QCIsCorrect,'}'), 
                                ','
                            ) AS OptionList

                        FROM S1
                        GROUP BY QHID
                    )SELECT TOP(2) * FROM S2

                """)
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()

            data = []
            for row in rows:
                item = dict(zip(columns, row))

                # ✅ Convert OptionList to list of dicts using regex + json
                options = []
                if item["OptionList"]:
                    matches = re.findall(r'{QCID:(\d+),QCTitle:"(.*?)",QCIsCorrect:(\d+)}', item["OptionList"])
                    for m in matches:
                        options.append({
                            "QCID": int(m[0]),
                            "QCTitle": m[1],
                            "QCIsCorrect": bool(int(m[2]))
                        })
                item["OptionList"] = options
                data.append(item)
            return Response(data)
            
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=500)

    def post(self, request):
        try:
            filters = []
            if 'IsDone' in request.data and  request.data['IsDone'] != '':
                filters.append(f"IsDone = {int(request.data['IsDone'])}")

            if 'IsCorrect' in request.data and request.data['IsCorrect'] != '':
                filters.append(f"IsCorrect = {int(request.data['IsCorrect'])}")


            if 'IsTag' in request.data and request.data['IsTag'] != '':
                filters.append(f"IsTag = {int(request.data['IsTag'])}")
    

            if 'THID' in request.data and request.data['THID']:
                filters.append(f"THID = {int(request.data['THID'])}")


            if 'CID' in request.data and request.data['CID']:
                filters.append(f"CID = {int(request.data['CID'])}")


            where_clause = " AND ".join(filters)
            if where_clause:
                where_clause = " WHERE " + where_clause
        
    
            sql = f"""
            WITH S1 AS (
                SELECT QH.*, QC.QCID, QC.QCTitle, QC.IsCorrect AS QCIsCorrect
                FROM QuestionHeader AS QH
                LEFT JOIN QuestionChoose AS QC ON QH.QHID = QC.QHID
                WHERE QCID IS NOT NULL
            ), S2 AS (
                SELECT 
                    QHID,
                    MAX(QHTitle) AS QHTitle,
                    MAX(CAST(QHMultiple AS INT)) AS QHMultiple,
                    MAX(Explain) AS Explain,
                    MAX(CAST(IsDone AS INT)) AS IsDone,
                    MAX(CAST(IsCorrect AS INT)) AS IsCorrect,
                    MAX(CAST(IsTag AS INT)) AS IsTag,
                    MAX(CreDateTime) AS CreDateTime,
                    MAX(UpdDateTime) AS UpdDateTime,
                    STRING_AGG(
                        CONCAT('{{QCID:', CAST(QCID AS NVARCHAR(MAX)), ',QCTitle:"', QCTitle, '",QCIsCorrect:', CAST(QCIsCorrect AS NVARCHAR(MAX)), '}}'), 
                        ','
                    ) AS OptionList
                FROM S1
                GROUP BY QHID
            ), S3 AS (
                SELECT  
                    S2.*,
                    QT.THID,
                    TH.TagTitle,
                    QCert.CID,
                    [Cert].CTitle
                FROM S2
                LEFT JOIN QuestionTag AS QT ON S2.QHID = QT.QHID
                LEFT JOIN TagHeader AS TH ON QT.THID = TH.THID
                LEFT JOIN QuestionCertified AS QCert ON S2.QHID = QCert.QHID
                LEFT JOIN Certified AS [Cert] ON QCert.CID = [Cert].CID
            )
            SELECT *
            FROM S3
            {where_clause}
            """ 

            with connection.cursor() as cursor:
                cursor.execute(sql)
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()

            data = []
            for row in rows:
                item = dict(zip(columns, row))
                # ✅ Convert OptionList to list of dicts using regex + json
                options = []
                if item["OptionList"]:
                    matches = re.findall(r'{QCID:(\d+),QCTitle:"(.*?)",QCIsCorrect:(\d+)}', item["OptionList"])
                    for m in matches:
                        options.append({
                            "QCID": int(m[0]),
                            "QCTitle": m[1],
                            "QCIsCorrect": bool(int(m[2]))
                        })
                item["OptionList"] = options
                data.append(item)
            return Response(data)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=500)

class QuestionHeaderInsert(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # 🔑 allow form-data


    def post(self, request, *args, **kwargs):

        try:
            uploaded_file = request.FILES.get('file')

            if not uploaded_file:
                return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

            # Example: Handle JSON file
            if uploaded_file.name.endswith(".json"):
                #print('upload success')
                try:
                    data = json.load(uploaded_file)
                    #Connect to DB & Insert
                    Insert_Ct = 0
                    with connection.cursor() as cursor:
                        for item in data:
                            qhtitle = item["QHTitle"]
                            qhmultiple = item["QHMultiple"]
                            explain = item["Explain"]
                            iscorrect = item["IsCorrect"]
                            istag = item["IsTag"]
                            #Insert QuestionHeader
                            cursor.execute("""
                                INSERT INTO QuestionHeader 
                                (QHTitle, QHMultiple, Explain, IsDone, IsCorrect, IsTag, CreDateTime, UpdDateTime)
                                OUTPUT INSERTED.QHID
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """, [qhtitle, qhmultiple, explain, 0, iscorrect, istag, datetime.now(), datetime.now()])

                            inserted_qhid = cursor.fetchone()[0]
                            #print(inserted_qhid)

                            #Insert QuestionChoose
                            for item2 in item['Option']:
                                cursor.execute("""
                                    INSERT INTO QuestionChoose 
                                    (QHID,QCTitle,IsCorrect,CreDateTime,UpdDateTime)
                                    VALUES (%s, %s, %s, %s, %s)
                                """, [ inserted_qhid, item2['title'], item2['IsCorret'],datetime.now(), datetime.now()])
                            
                            #Insert QuestionCertificate
                            cursor.execute("""
                                INSERT INTO QuestionCertified
                                (CID,QHID,CreDateTime,UpdDateTime)
                                VALUES (%s, %s, %s, %s)
                            """, [item['CID'], inserted_qhid,datetime.now(),datetime.now()])
                            
                            #Insert QuestionTag
                            cursor.execute("""
                                INSERT INTO QuestionTag
                                (THID,QHID,CreDateTime,UpdDateTime)
                                VALUES (%s, %s, %s, %s)
                            """, [item['THID'], inserted_qhid,datetime.now(),datetime.now()])
                            Insert_Ct += 1


                    return Response({
                        "InsertCt": Insert_Ct,
                        "status": "success"
                    })
                except Exception as e:
                    return Response({"error": f"Invalid JSON: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            # Example: Handle text/csv or others
            return Response({
                "filename": uploaded_file.name,
                "size_kb": round(uploaded_file.size / 1024, 2),
                "content_type": uploaded_file.content_type,
                "status": "uploaded"
            })
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=500)

class QuestionConverter(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # 🔑 allow form-data

    def post(self,request,*args,**kwargs):
        try:
            #print(request.data['Input_CID'])
            Input_CID = int(request.data['CID'])
            raw = request.data.get('random')  # e.g. "5"
            try:
                rand_upper = int(raw) if raw is not None else None
            except ValueError:
                rand_upper = None

            def gen_thid():
                if rand_upper is not None and rand_upper > 1:
                    return str(random.randint(1, rand_upper))  # inclusive
                return ''

            uploaded_file = request.FILES.get('file')
 
            if not uploaded_file:
                return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

            soup = BeautifulSoup(uploaded_file.read(), "html.parser")
            
            wrappers = soup.find_all("div", class_="result-pane--question-result-pane-wrapper--2bGiz")
            output = []

            for i, wrapper in enumerate(wrappers, start=1):
                #current_qhid = last_qhid + i

                # Find the actual question div inside wrapper
                qdiv = wrapper.find("div", class_="result-pane--question-result-pane--sIcOh")
                if not qdiv:
                    continue

                # Question text
                question_div = qdiv.find("div", id="question-prompt")
                question_text = question_div.get_text(strip=True) if question_div else ""

                # Correct/Incorrect status
                status_span = qdiv.find("span", attrs={"data-purpose": "question-result-header-status-label"})
                correctness = status_span.get_text(strip=True) if status_span else ""

                # Options
                answer_blocks = qdiv.find_all("div", class_="result-pane--answer-result-pane--Niazi")
                options = []
                correct_count = 0

                for block in answer_blocks:
                    answer_text_div = block.find("div", id="answer-text")
                    answer_text = answer_text_div.get_text(strip=True) if answer_text_div else ""

                    label_span = block.find("span", attrs={"data-purpose": "answer-result-header-user-label"})
                    label_text = label_span.get_text(strip=True) if label_span else ""
                    is_correct = "True" if label_text in ["正確答案", "您答對了", "您的選擇正確", "正確選擇"] else "False"

                    if is_correct == "True":
                        correct_count += 1

                    options.append({
                        "title": answer_text,
                        "IsCorret": is_correct
                    })

                is_multiple = True if correct_count > 1 else False

                # Explanation
                explanation_div = qdiv.find("div", class_="overall-explanation-pane--overall-explanation--G-hLQ")
                explanation = explanation_div.get_text(separator="\n", strip=True) if explanation_div else ""

                # ✅ Tag detection must be done in wrapper, not just qdiv
                is_tag = wrapper.find("use", attrs={"xlink:href": "#icon-saved"}) is not None

                # Collect final object
                output.append({
                    "IsCorrect": True if correctness == "正確" else False,
                    "QHTitle": question_text,
                    "Option": options,
                    "QHMultiple": is_multiple,
                    "Explain": explanation,
                    "IsTag": is_tag,
                    "CID": Input_CID,
                    "THID": gen_thid(),
                })

            # Save to JSON
            json_bytes = json.dumps(output, ensure_ascii=False, indent=2).encode("utf-8")
            return FileResponse(
                io.BytesIO(json_bytes),
                as_attachment=True,
                filename="output.json",
                content_type="application/json",
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QuestionRecord(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            QHID = request.query_params.get('QHID') 
            #print(QHID)

            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        QE.QEID,
                        MAX(QE.QHID) AS QHID,
                        MAX(CAST(QE.IsCorrect AS INT)) AS IsCorrect,
                        MAX(QE.CreDateTime) AS CreDateTime,
                        STRING_AGG(
                            CONCAT('{{QCTitle:"',QC.QCTItle,'",IsCorrect:',QC.IsCorrect,'}}'),
                            ','
                        ) AS OptionList
                    FROM QuestionEvent AS QE
                    LEFT JOIN QuestionRecord AS QR ON QE.QEID = QR.QEID
                    LEFT JOIN QuestionChoose AS QC ON QR.QCID = QC.QCID

                    WHERE QE.QHID = {QHID}
                    GROUP BY QE.QEID

                """)
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
                data = [dict(zip(columns, row)) for row in rows]

            return Response({"RecordHistory":data})

        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=500)

    def post(self, request):
        #print(request.data)
        """
        {
            "QHID":27,
            "QCID":[114,116],
            "IsCorrect":1
        }
        """
        try:
            QHID = request.data['QHID']
            QCID_list = request.data['QCID']
            IsCorrect = request.data['IsCorrect']

            # Validate QCID_list is a list of ints
            if not isinstance(QCID_list, list) or not all(isinstance(x, int) for x in QCID_list):
                return Response({'error': 'QCID must be a list of integers'}, status=400)

            # Construct VALUES for bulk insert
            values_clause = ",\n".join([
                f"({qcid}, @QEID, GETDATE(), GETDATE())"
                for qcid in QCID_list
            ])

            sql = f"""
                DECLARE @QEID INT;
                INSERT INTO QuestionEvent (QHID, IsCorrect, CreDateTime, UpdDateTime)
                VALUES ({QHID}, {IsCorrect}, GETDATE(), GETDATE());
                SET @QEID = SCOPE_IDENTITY();
                INSERT INTO QuestionRecord (QCID, QEID, CreDateTime, UpdDateTime)
                VALUES 
                {values_clause}
            """ 
            with connection.cursor() as cursor:
                cursor.execute(sql)
            return Response({'message': 'Success'}, status=200)

        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=500)



class QuestionStatus(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


    def post(self, request):
        try:
            QHID = request.data['QHID']
            IsDone = request.data['IsDone']
            IsCorrect = request.data['IsCorrect']
            IsTag = request.data['IsTag']
            THID = request.data['THID']
            CID = request.data['CID']


            sql = f"""
                BEGIN TRANSACTION;

                -- 1. Update QuestionHeader
                UPDATE QuestionHeader
                SET 
                    IsDone = {IsDone},
                    IsCorrect = {IsCorrect},
                    IsTag = {IsTag}
                WHERE QHID = {QHID};

                -- 2. Update QuestionTag
                UPDATE QuestionTag
                SET 
                    THID = {THID}
                WHERE QHID = {QHID};

                -- 3. Update QuestionCertified
                UPDATE QuestionCertified
                SET 
                    CID = {CID}
                WHERE QHID = {QHID};

                COMMIT;
            """ 
            with connection.cursor() as cursor:
                cursor.execute(sql)
            return Response({'message': 'Success'}, status=200)

        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=500)

