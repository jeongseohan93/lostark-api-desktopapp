# 로스트아크 오픈 API 사용 가이드 (USAGE GUIDE)

이 가이드는 로스트아크 오픈 API와 상호작용하는 방법을 설명합니다. 소프트웨어 개발자를 대상으로 하며, 구현 세부 정보와 샘플 코드를 안내합니다.

---

## 기본 HTTP (Basic HTTP)

로스트아크 오픈 API 서비스에 유효한 HTTP 요청을 보내려면 다음 세 가지 과정이 필요합니다:

1. 올바른 HTTP 메서드(verb)를 설정합니다.
2. `accept` 헤더에 `application/json`을 설정하고, 필요한 경우 `content-type` 헤더도 설정합니다.
3. `authorization` 헤더에 Bearer 토큰을 설정합니다.

> **참고:** 모든 API 요청에는 반드시 JWT가 포함되어야 합니다. `authorization` 헤더에 이를 지정해 주세요.

### curl 예시
```bash
curl -X 'GET' 'https://developer-lostark.game.onstove.com/exmaple/api' -H "accept: application/json" -H "authorization: bearer your_JWT"
```

### Javascript 예시
```javascript
var xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open("GET", "https://developer-lostark.game.onstove.com/exmaple/api", true);
xmlHttpRequest.setRequestHeader('accept', 'application/json');
xmlHttpRequest.setRequestHeader('authorization', 'bearer your_JWT');
xmlHttpRequest.onreadystatechange = () => { };
xmlHttpRequest.send();
```

---

## 로스트아크 오픈 API GET 요청 예시

`GET /guilds/rankings` API는 `serverName` 문자열을 요청 매개변수(parameter)로 받습니다. 쿼리 문자열(Query string) 방식이므로 요청 URL을 다음과 같이 구성하세요:

### 쿼리 문자열 매개변수 curl 예시
```bash
curl -X 'GET' 'https://developer-lostark.game.onstove.com/guilds/rankings?serverName=%EB%A3%A8%ED%8E%98%EC%98%A8' -H 'accept: application/json' -H 'authorization: bearer your_JWT'
```

### 쿼리 문자열 매개변수 Javascript 예시
```javascript
var xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open("GET", "https://developer-lostark.game.onstove.com/guilds/rankings?serverName=%EB%A3%A8%ED%8E%98%EC%98%A8", true);
xmlHttpRequest.setRequestHeader('accept', 'application/json');
xmlHttpRequest.setRequestHeader('authorization', 'bearer your_JWT');
xmlHttpRequest.onreadystatechange = () => { };
xmlHttpRequest.send();
```

`GET /armories/characters/{characterName}/profiles` API는 `characterName` 문자열을 요청 매개변수로 받습니다. 경로 문자열(Path string) 방식이므로 요청 URL을 다음과 같이 구성해야 합니다:

### 경로 매개변수 curl 예시
```bash
curl -X 'GET' 'https://developer-lostark.game.onstove.com/armories/characters/coolguy/profiles' -H 'accept: application/json' -H 'authorization: bearer your_JWT'
```

### 경로 매개변수 Javascript 예시
```javascript
var xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open("GET", "https://developer-lostark.game.onstove.com/armories/characters/coolguy/profiles", true);
xmlHttpRequest.setRequestHeader('accept', 'application/json');
xmlHttpRequest.setRequestHeader('authorization', 'bearer your_JWT');
xmlHttpRequest.onreadystatechange = () => { };
xmlHttpRequest.send();
```

---

## 로스트아크 오픈 API POST 요청 예시

`POST /auction/items` API는 POST 본문(body)으로 `requestAuctionItems` 객체가 필요합니다. curl에서는 `-d` 옵션을 사용하여 객체 본문을 지정할 수 있습니다.

### POST 본문 curl 예시
```bash
curl -X 'POST' 'https://developer-lostark.game.onstove.com/markets/items'   -H 'accept: application/json'   -H 'authorization: bearer your_JWT'   -H 'Content-Type: application/json'   -d '{
  "CategoryCode": 20000
}'
```

### POST 본문 Javascript 예시
```javascript
var xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open("POST", "https://developer-lostark.game.onstove.com/markets/items", true);
xmlHttpRequest.setRequestHeader('accept', 'application/json');
xmlHttpRequest.setRequestHeader('authorization', 'bearer your_JWT');
xmlHttpRequest.setRequestHeader('content-Type', 'application/json');
xmlHttpRequest.onreadystatechange = () => { };
xmlHttpRequest.send(JSON.stringify({"CategoryCode" : 20000}));
```

---

## API 에러 (API Errors)

로스트아크 오픈 API는 기본적인 HTTP 에러 코드를 반환합니다. 아래 표를 참조하세요.

| 코드 | 설명 (Description) |
| :--- | :--- |
| **200** | OK (정상 처리) |
| **401** | Unauthorized (인증 실패) |
| **403** | Forbidden (접근 거부) |
| **404** | Not Found (찾을 수 없음) |
| **415** | Unsupported Media Type (지원하지 않는 미디어 타입) |
| **429** | Rate Limit Exceeded (요청 제한 초과) |
| **500** | Internal Server Error (내부 서버 오류) |
| **502** | Bad Gateway (불량 게이트웨이) |
| **503** | Service Unavailable (서비스 이용 불가) |
| **504** | Gateway Timeout (게이트웨이 시간 초과) |

---

## 점검 시간 중 API 요청 (API Requests during Maintenance Hours)

점검 중에는 웹사이트 전체에 점검 페이지가 표시되며, 요청 시 `503 Service Unavailable` HTTP 상태 코드가 반환됩니다. 이 상태 코드가 발생하면 추가 요청을 자제하거나 요청 간격을 조정하는 것이 좋습니다.

---

## 비효율적인 API 요청 (Inefficient API Requests)

요청 할당량을 효과적으로 사용하세요! 처리율 제한(Throttling)이 적용되므로 애플리케이션에 강력한 캐싱 전략을 구현하는 것이 필수적입니다. 인게임 데이터의 효율적인 관리가 중요하며, 특정 데이터 세트의 경우 하루나 일주일에 한 번만 API를 호출해도 충분할 수 있습니다. 

**예시:**
* `GET /news/events`
* `GET /auctions/options`
* `GET /markets/options`

이러한 API들의 응답 데이터는 현재 리소스나 응답 모델을 변경하는 예기치 않은 점검이 없는 한 일반적으로 정적으로 유지됩니다. 지속적으로 요청을 생성하여 할당량을 초과하면 애플리케이션에 제한이 걸려 할당량이 갱신될 때까지 기다려야 합니다. 마이크로초 단위의 과도한 폴링(polling)이나 사용자 상호 작용마다 트리거되는 중복 요청은 자제하는 것이 좋습니다.

---

## API 요청 제한 (API Request Limit)

당사는 카운터와 타임스탬프 접근을 제공하여 클라이언트의 요청 속도 관리를 돕습니다. 아래의 응답 헤더는 분당 허용되는 요청 수, 남은 요청 수, 그리고 다음 할당량 갱신 시간을 나타냅니다.

**참고 응답 헤더:**

| 응답 헤더 키 (Key) | 응답 헤더 값 (Value) | 설명 (Desc) |
| :--- | :--- | :--- |
| **X-RateLimit-Limit** | `100` | 분당 요청 제한 수 |
| **X-RateLimit-Remaining** | `15` | 클라이언트가 사용할 수 있는 남은 요청 수 |
| **X-RateLimit-Reset** | `1668659557` | 다음 할당량 갱신을 위한 UNIX 타임스탬프 |

---

## API 상태 (API Status)

API 상태는 5가지로 나뉩니다.

* 서버가 상태 메타데이터를 가져오려고 시도 중입니다.
* 서버가 작동하지 않습니다.
* 서버가 부분적으로 작동 중입니다.
* 서버가 완전히 작동 중입니다.
* 서버가 점검 중입니다.

---

## API 버전 관리 (API Versioning)

변경 사항(changelog)을 자주 확인하여 최신 상태를 유지하세요. 다음의 경우 버전을 올립니다(increment):

* 새로운 엔드포인트(endpoints) 추가 시
* 엔드포인트 제거 시
* 호환되지 않는 API 변경 발생 시

---

## 지원 중단 (Deprecation)

API 엔드포인트, 응답 데이터의 속성/필드, 매개변수 등은 다양한 이유로 지원이 중단될 수 있습니다. 유감스럽게도 게임 데이터의 갑작스러운 변경으로 인해 항상 사전에 안내해 드리지는 못할 수 있습니다.