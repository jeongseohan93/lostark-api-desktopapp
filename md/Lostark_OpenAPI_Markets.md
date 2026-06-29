# 로스트아크 오픈 API - 거래소 (MARKETS)

이 문서는 로스트아크 오픈 API의 거래소(MARKETS) 관련 엔드포인트 및 데이터 모델에 대한 가이드입니다.

---

## API 엔드포인트

### 1. 거래소 검색 옵션 조회
**`GET`** `/markets/options`
거래소 검색에 사용할 수 있는 옵션(카테고리, 아이템 등급, 직업 등)을 반환합니다.

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

---

### 2. 특정 거래소 아이템 조회 (시세 및 통계)
**`GET`** `/markets/items/{itemId}`
아이템 ID를 통해 특정 거래소 아이템의 정보 및 시세 통계를 반환합니다.

#### 요청 매개변수 (Parameters)
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `itemId` | integer ($int64) | path | **필수** (*) | 조회할 아이템의 ID |

---

### 3. 거래소 매물 검색
**`POST`** `/markets/items`
검색 옵션을 적용하여 현재 활성화된 거래소 매물 목록을 반환합니다.

#### 요청 매개변수 (Parameters)
* **Parameter content type:** `application/json`

| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `requestMarketItems` | object | body | **필수** (*) | 거래소 검색 옵션 (`RequestMarketItems` 모델 참조) |

---

### 4. 최근 거래된 매물 검색
**`POST`** `/markets/trades`
검색 옵션을 적용하여 최근 거래가 완료된 매물 목록을 반환합니다.

#### 요청 매개변수 (Parameters)
* **Parameter content type:** `application/json`

| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `requestMarketItems` | object | body | **필수** (*) | 거래소 검색 옵션 (`RequestMarketItems` 모델 참조) |

---

## 데이터 모델 (Models) 요약

### 1. RequestMarketItems (거래소 검색 요청 모델)
거래소 매물 검색 시 body에 포함되는 검색 조건 객체입니다.
*   **`Sort`** (string): 정렬 기준 (Enum: `GRADE`, `YDAY_AVG_PRICE`, `RECENT_PRICE`, `CURRENT_MIN_PRICE`)
*   **`CategoryCode`** (int): 아이템 카테고리 코드
*   **`CharacterClass`** (string): 직업명
*   **`ItemTier`** (int, null): 아이템 티어
*   **`ItemGrade`** (string): 아이템 등급
*   **`ItemName`** (string): 아이템명 (검색어)
*   **`PageNo`** (int): 페이지 번호
*   **`SortCondition`** (string): 정렬 방식 (Enum: `ASC`, `DESC`)

### 2. MarketItemStats (거래소 아이템 통계 모델)
`/markets/items/{itemId}` 호출 시 반환되는 시세 정보입니다.
*   **`Name`** (string): 아이템명
*   **`TradeRemainCount`** (int, null): 거래 가능 횟수
*   **`BundleCount`** (int): 묶음 수량
*   **`Stats`** (Array): 일자별 통계 목록 (`MarketStatsInfo` 객체 배열)
*   **`ToolTip`** (string): 툴팁 정보

### 3. MarketStatsInfo (일자별 시세 정보)
*   **`Date`** (string): 날짜
*   **`AvgPrice`** (double): 평균 거래가
*   **`TradeCount`** (int): 거래 량

### 4. MarketItem (거래소 활성 매물 정보)
`/markets/items` (POST) 호출 시 반환되는 매물 객체입니다.
*   **`CurrentMinPrice`** (int): 현재 최저가
*   **`Id`** (long): 아이템 ID
*   **`Name`** (string): 아이템명
*   **`Grade`** (string): 아이템 등급
*   **`Icon`** (string): 아이콘 이미지 URL
*   **`BundleCount`** (int): 묶음 수량
*   **`TradeRemainCount`** (int, null): 구매 후 거래 가능 횟수
*   **`YDayAvgPrice`** (double): 전일 평균가
*   **`RecentPrice`** (int): 최근 거래가

### 5. TradeMarketItem (최근 거래 완료 매물 정보)
`/markets/trades` (POST) 호출 시 반환되는 매물 객체입니다.
*   **`Id`** (long): 아이템 ID
*   **`Name`** (string): 아이템명
*   **`Grade`** (string): 아이템 등급
*   **`Icon`** (string): 아이콘 이미지 URL
*   **`BundleCount`** (int): 묶음 수량
*   **`TradeRemainCount`** (int, null): 거래 가능 횟수
*   **`YDayAvgPrice`** (double): 전일 평균가
*   **`RecentPrice`** (int): 최근 거래가
