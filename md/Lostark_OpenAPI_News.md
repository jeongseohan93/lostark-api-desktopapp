# 로스트아크 오픈 API - 뉴스 (NEWS)

이 문서는 로스트아크 오픈 API의 뉴스(NEWS) 관련 엔드포인트 및 데이터 모델에 대한 가이드입니다.

---

## API 엔드포인트

### 1. 공지사항 목록 조회
**`GET`** `/news/notices`
공지사항 목록을 반환합니다.

#### 요청 매개변수 (Parameters)
| 이름 | 타입 | 위치 | 설명 |
| :--- | :--- | :--- | :--- |
| `searchText` | string | query | 제목 검색을 위한 키워드 |
| `type` | string | query | 공지 타입 (사용 가능한 값: `공지`, `점검`, `상점`, `이벤트`) |

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
```json
[
  {
    "Title": "string",
    "Date": "2026-06-29T09:07:00.484Z",
    "Link": "string",
    "Type": "공지"
  }
]