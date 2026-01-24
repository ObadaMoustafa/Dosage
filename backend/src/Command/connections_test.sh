#login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com", "password":";lkj;lkj"}'
# todo: GET my THERAPIST connections.
# todo: GET my FAMILY connections.
# todo: GET my patients. // {read_only, full_access}
# todo: GET my people I care of. // {read_only}
# generate a code for a doctor
curl -X POST http://127.0.0.1:8000/api/pairing/code \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "THERAPIST"}'

# generate a code for a family
curl -X POST http://127.0.0.1:8000/api/pairing/code \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "FAMILY"}'

# link using generated code
curl -X POST http://127.0.0.1:8000/api/pairing/link \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "CODE_FROM_STEP_1"}'

# unlink connection
curl -X DELETE http://127.0.0.1:8000/api/pairing/unlink/CONNECTION_UUID_HERE \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"