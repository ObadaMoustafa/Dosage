# search medicine (Medicijnen)
curl "http://127.0.0.1:8000/api/medicines/search?q=asp" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# GET mijn medicijnen
curl -X GET http://127.0.0.1:8000/api/my-medicines \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"

# GET another patient's medicines
curl -X GET "http://127.0.0.1:8000/api/my-medicines?user_id=TARGET_PATIENT_UUID" \
  -H "Authorization: Bearer YOUR_THERAPIST_TOKEN"

# GET a specific Medicijn ✅

# POST: Add a medicijn
curl -X POST http://127.0.0.1:8000/api/my-medicines \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicijn_naam": "Paracetamol",
    "toedieningsvorm": "Tablet",
    "sterkte": "500mg",
    "beschrijving": "Neem 1 tablet na het eten bij pijn.",
    "bijsluiter": "Niet meer dan 6 per dag."
  }'

# PUT: Edit a medicine ✅

# DELETE a medicijn
curl -X DELETE http://127.0.0.1:8000/api/my-medicines/MEDICINE_UUID_HERE \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
