# 로스트아크 오픈 API - 무기고 (ARMORIES)

이 문서는 로스트아크 오픈 API의 무기고(ARMORIES) 관련 엔드포인트 및 데이터 모델에 대한 가이드입니다. 각 캐릭터의 상세 정보를 조회할 수 있습니다.

---

## API 엔드포인트

### 1. 캐릭터 프로필 요약 조회
**`GET`** `/armories/characters/{characterName}`
캐릭터 이름으로 프로필 정보 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |
| `filters` | string | query | 선택 | 데이터 필터링 (예: `profiles+equipment+avatars+combat-skills+engravings+cards+gems+colosseums+collectibles+arkpassive+arkgrid`) |

---

### 2. 캐릭터 기본 스탯 조회
**`GET`** `/armories/characters/{characterName}/profiles`
캐릭터 이름으로 기본 스탯 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 3. 캐릭터 장착 장비 조회
**`GET`** `/armories/characters/{characterName}/equipment`
캐릭터가 장착한 장비 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 4. 캐릭터 아바타 조회
**`GET`** `/armories/characters/{characterName}/avatars`
캐릭터가 장착한 아바타 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 5. 캐릭터 전투 스킬 조회
**`GET`** `/armories/characters/{characterName}/combat-skills`
캐릭터의 전투 스킬 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 6. 캐릭터 각인 조회
**`GET`** `/armories/characters/{characterName}/engravings`
캐릭터가 장착한 각인 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 7. 캐릭터 카드 조회
**`GET`** `/armories/characters/{characterName}/cards`
캐릭터가 장착한 카드 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 8. 캐릭터 보석 조회
**`GET`** `/armories/characters/{characterName}/gems`
캐릭터가 장착한 보석 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 9. 캐릭터 증명의 전장 조회
**`GET`** `/armories/characters/{characterName}/colosseums`
캐릭터의 증명의 전장 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 10. 캐릭터 수집품 조회
**`GET`** `/armories/characters/{characterName}/collectibles`
캐릭터의 수집품 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 11. 캐릭터 아크 패시브 조회
**`GET`** `/armories/characters/{characterName}/arkpassive`
캐릭터의 아크 패시브 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

### 12. 캐릭터 아크 그리드 조회
**`GET`** `/armories/characters/{characterName}/arkgrid`
캐릭터의 아크 그리드 요약을 반환합니다.

#### 요청 매개변수
| 이름 | 타입 | 위치 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `characterName` | string | path | **필수** | 검색할 캐릭터 이름 |

---

## 데이터 모델 (Models) 요약

### 주요 데이터 모델
*   **`ArmoryProfile`**: 캐릭터 기본 정보 (레벨, 스탯, 길드, 서버, 영지 등)
*   **`ArmoryEquipment`**: 장비 정보 (타입, 이름, 아이콘, 등급, 툴팁)
*   **`ArmoryAvatar`**: 아바타 정보 (타입, 이름, 등급, 이너 아바타 여부 등)
*   **`ArmorySkill`**: 스킬 정보 (레벨, 트라이포드, 룬 등)
*   **`ArmoryEngraving`**: 각인 및 아크 패시브 효과
*   **`ArmoryCard`**: 장착된 카드 및 카드 세트 효과
*   **`ArmoryGem`**: 장착된 보석 및 스킬 효과
*   **`ColosseumInfo`**: 증명의 전장 (경쟁전, 대장전, 섬멸전 등) 전적
*   **`Collectible`**: 수집품 포인트 정보
*   **`ArkPassive`**: 아크 패시브 포인트 및 효과
*   **`ArkGrid`**: 아크 그리드 슬롯 및 보석 정보

> *응답(Response) 코드는 모두 공통적으로 200(OK), 400, 401, 403, 404, 415, 429, 500, 502, 503, 504를 사용합니다.*
