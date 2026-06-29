markdown_content = """# 로스트아크 오픈 API - 캐릭터 (CHARACTERS)

이 문서는 로스트아크 오픈 API의 캐릭터(CHARACTERS) 관련 엔드포인트 및 데이터 모델에 대한 가이드입니다.

---

## API 엔드포인트

### 1. 계정 내 모든 캐릭터 프로필 조회
**`GET`** `/characters/{characterName}/siblings`
지정한 캐릭터가 속한 계정의 모든 캐릭터 프로필 목록을 반환합니다.

#### 요청 매개변수 (Parameters)
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** (*) | 검색할 대상 캐릭터의 이름 |

#### 응답 (Responses)
* **Response content type:** `application/json`

| 상태 코드 | 설명 |
| :--- | :--- |
| **200** | OK |
| **400** | Bad Request |
| **401** | Unauthorized |
| **403** | Forbidden |
| **404** | Not Found |
| **415** | Unsupported Media Type |
| **429** | Rate Limit Exceeded |
| **500** | Internal Server Error |
| **502** | Bad Gateway |
| **503** | Service Unavailable |
| **504** | Gateway Timeout |

**200 OK 예시:**