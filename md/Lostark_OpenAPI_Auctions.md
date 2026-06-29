# 로스트아크 오픈 API - 경매장 (AUCTIONS)

이 문서는 로스트아크 오픈 API의 경매장(AUCTIONS) 관련 엔드포인트 및 데이터 모델에 대한 가이드입니다.

---

## API 엔드포인트

### 1. 경매장 검색 옵션 조회
**`GET`** `/auctions/options`
경매장에 사용 가능한 검색 옵션 목록(카테고리, 아이템 등급, 직업 등)을 반환합니다.

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

### 2. 경매장 매물 검색
**`POST`** `/auctions/items`
검색 옵션을 적용하여 현재 활성화된 경매장 매물 목록을 반환합니다.

#### 요청 매개변수 (Parameters)
* **Parameter content type:** `application/json`

| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `requestAuctionItems` | object | body | **필수** (*) | 경매장 검색 옵션 (`RequestAuctionItems` 모델 참조) |

#### 응답 (Responses)
* **Response content type:** `application/json`
*(에러 상태 코드는 `/auctions/options`와 동일합니다.)*

---

## 데이터 모델 (Models) 요약

### 1. RequestAuctionItems (경매장 검색 요청 모델)
경매장 매물 검색 시 body에 포함되는 검색 조건 객체입니다.
*   **`ItemLevelMin`** (int): 최소 아이템 레벨
*   **`ItemLevelMax`** (int): 최대 아이템 레벨
*   **`ItemGradeQuality`** (int, null): 아이템 품질
*   **`ItemUpgradeLevel`** (int, null): 아이템 강화 단계
*   **`ItemTradeAllowCount`** (int, null): 거래 가능 횟수
*   **`SkillOptions`** (Array): 스킬 상세 검색 옵션 (`SearchDetailOption`)
*   **`EtcOptions`** (Array): 기타 상세 검색 옵션 (`SearchDetailOption`)
*   **`Sort`** (string): 정렬 기준 (Enum: `BIDSTART_PRICE`, `BUY_PRICE`, `EXPIREDATE`, `ITEM_GRADE`, `ITEM_LEVEL`, `ITEM_QUALITY`)
*   **`SortCondition`** (string): 정렬 방식 (Enum: `ASC`, `DESC`)
*   **`CategoryCode`** (int): 아이템 카테고리 코드
*   **`CharacterClass`** (string): 직업명
*   **`ItemTier`** (int, null): 아이템 티어
*   **`ItemGrade`** (string): 아이템 등급
*   **`ItemName`** (string): 아이템명 (검색어)
*   **`PageNo`** (int): 페이지 번호

### 2. Auction (경매장 매물 응답 모델)
*   **`PageNo`** (int): 현재 페이지 번호
*   **`PageSize`** (int): 페이지당 매물 수
*   **`TotalCount`** (long): 조건에 맞는 전체 매물 수
*   **`Items`** (Array): 매물 목록 (`AuctionItem` 객체 배열)

### 3. AuctionItem (개별 매물 정보)
*   **`Name`** (string): 아이템명
*   **`Grade`** (string): 아이템 등급
*   **`Tier`** (int): 아이템 티어
*   **`Level`** (int, null): 아이템 레벨
*   **`Icon`** (string): 아이콘 이미지 URL
*   **`GradeQuality`** (int, null): 아이템 품질 수치
*   **`AuctionInfo`** (`AuctionInfo`): 경매 세부 정보
*   **`Options`** (Array): 아이템이 가진 옵션 목록 (`ItemOption`)

### 4. AuctionInfo (경매 세부 정보)
*   **`StartPrice`** (long): 최초 등록가 (시작가)
*   **`BuyPrice`** (long, null): 즉시 구매가 (null일 경우 즉시 구매 불가)
*   **`BidPrice`** (long): 현재 최고 입찰가
*   **`EndDate`** (string, $date-time): 경매 종료 일시
*   **`BidCount`** (int): 현재까지의 입찰 횟수
*   **`BidStartPrice`** (long): 최소 입찰 가능 금액
*   **`IsCompetitive`** (boolean): 경쟁 입찰 진행 여부
*   **`TradeAllowCount`** (int): 구매 후 남은 거래 가능 횟수
*   **`UpgradeLevel`** (int, null): 강화 단계

### 5. ItemOption (아이템 세부 옵션)
*   **`Type`** (string): 옵션 타입 (Enum: `None`, `SKILL`, `STAT`, `ABILITY_ENGRAVE`, `BRACELET_SPECIAL_EFFECTS`, `GEM_SKILL_DAMAGE`, `GEM_SKILL_COOLDOWN_REDUCTION`, `GEM_SKILL_SUPPORT`, `ACCESSORY_UPGRADE`, `ARK_PASSIVE`, `BRACELET_RANDOM_SLOT`)
*   **`OptionName`** (string): 옵션명
*   **`OptionNameTripod`** (string): 트라이포드 옵션명
*   **`Value`** (double): 옵션 수치
*   **`IsPenalty`** (boolean): 페널티(감소) 옵션 여부
*   **`ClassName`** (string): 직업 전용 옵션일 경우 직업명
*   **`IsValuePercentage`** (boolean): 수치가 퍼센트(%) 단위인지 여부
