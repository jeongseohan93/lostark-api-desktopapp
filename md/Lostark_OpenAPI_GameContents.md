# 로스트아크 오픈 API - 게임 콘텐츠 (GAMECONTENTS)

이 문서는 로스트아크 오픈 API의 게임 콘텐츠(GAMECONTENTS) 관련 엔드포인트 및 데이터 모델에 대한 가이드입니다.

---

## API 엔드포인트

### 1. 캘린더 일정 조회
**`GET`** `/gamecontents/calendar`
이번 주 캘린더 콘텐츠 목록을 반환합니다.

#### 요청 매개변수 (Parameters)
* 없음 (No parameters)

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
    "CategoryName": "string",
    "ContentsName": "string",
    "ContentsIcon": "string",
    "MinItemLevel": 0,
    "StartTimes": [
      "2026-06-29T09:36:55.314Z"
    ],
    "Location": "string",
    "RewardItems": [
      {
        "ItemLevel": 0,
        "Items": [
          {
            "Name": "string",
            "Icon": "string",
            "Grade": "string",
            "StartTimes": [
              "2026-06-29T09:36:55.314Z"
            ]
          }
        ]
      }
    ]
  }
]
```

---

## 데이터 모델 (Models)

### ContentsCalendar (캘린더 콘텐츠 정보)
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `CategoryName` | string | 카테고리명 |
| `ContentsName` | string | 콘텐츠명 |
| `ContentsIcon` | string | 콘텐츠 아이콘 URL |
| `MinItemLevel` | integer ($int32) | 최소 아이템 레벨 |
| `StartTimes` | Array of string ($date-time) | 시작 시간 목록 |
| `Location` | string | 위치 |
| `RewardItems` | Array | 보상 아이템 목록 (`LevelRewardItems` 객체 배열) |

### LevelRewardItems (레벨별 보상 아이템 정보)
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `ItemLevel` | integer ($int32) | 보상 기준 아이템 레벨 |
| `Items` | Array | 보상 아이템 상세 (`RewardItem` 객체 배열) |

### RewardItem (보상 아이템 상세)
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `Name` | string | 아이템명 |
| `Icon` | string | 아이템 아이콘 URL |
| `Grade` | string | 아이템 등급 |
| `StartTimes` | Array of string ($date-time) | 보상 지급(해당 일정) 시작 시간 목록 |
