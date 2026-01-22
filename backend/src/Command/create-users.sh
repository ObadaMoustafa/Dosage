curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com", "password":";lkj;lkj", "first_name":"User1", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com", "password":";lkj;lkj", "first_name":"User2", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user3@test.com", "password":";lkj;lkj", "first_name":"User3", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user4@test.com", "password":";lkj;lkj", "first_name":"User4", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user5@test.com", "password":";lkj;lkj", "first_name":"User5", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user6@test.com", "password":";lkj;lkj", "first_name":"User6", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user7@test.com", "password":";lkj;lkj", "first_name":"User7", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user8@test.com", "password":";lkj;lkj", "first_name":"User8", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user9@test.com", "password":";lkj;lkj", "first_name":"User9", "last_name":"Test"}' && \
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user10@test.com", "password":";lkj;lkj", "first_name":"User10", "last_name":"Test"}'