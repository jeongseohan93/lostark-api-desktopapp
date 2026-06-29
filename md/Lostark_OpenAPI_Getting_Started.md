# 로스트아크 오픈 API 시작하기 (GETTING STARTED)

아래의 기본 절차를 따라 로스트아크 오픈 API가 어떻게 작동하는지 이해하고 사용을 시작할 수 있습니다.

## 로그인
로스트아크 오픈 API를 사용하려면 먼저 Stove.com 계정으로 로그인해야 합니다. 아직 계정이 없다면 먼저 가입해 주세요. 로스트아크 오픈 API 웹사이트를 이용하기 위한 추가 가입 절차는 없으며, Stove 가입만으로 충분합니다. 로그인하면 즉시 새로운 클라이언트를 생성할 수 있습니다.

## 클라이언트 생성
다음 단계에 따라 클라이언트를 생성하세요:

1. **CREATE A NEW CLIENT**(새 클라이언트 생성) 버튼 또는 제공된 링크를 클릭합니다.
2. **Client Name**(클라이언트 이름) 필드에 목록에서 클라이언트를 식별할 수 있는 이름을 입력합니다. 이 이름은 귀하의 계정에만 연결됩니다.
3. **Client URL**(클라이언트 URL) 필드에 이 클라이언트를 사용할 서비스의 URL을 입력합니다.
4. **Client Description**(클라이언트 설명) 필드에 애플리케이션이 수행할 작업을 설명합니다.
5. 이용 약관(Terms of Use) 및 개인정보 처리방침(Privacy Policy)을 읽고 동의합니다. (선택 사항이 아닌 **필수**입니다.)
6. 클라이언트를 생성한 후, **MY CLIENTS**(내 클라이언트) 페이지에서 세부 정보를 확인하거나, 우측 상단의 빨간색 사용자(identity) 버튼을 클릭하여 나타나는 팝업에서 확인할 수 있습니다.

## JWT 키
클라이언트를 생성하면 즉시 JWT가 발급됩니다. 당사의 시스템에는 OAuth 보안 계층이 적용되어 있으나, 만료된 토큰을 갱신하거나 새 액세스 토큰을 요청하는 번거로운 작업을 수행할 필요가 없습니다.

발급된 보안 토큰은 당사에서 해당 키가 안전하지 않다고 판단하거나 사용자가 클라이언트를 삭제하지 않는 한 **무기한 유효**합니다. JWT 토큰은 신뢰할 수 있는 서버 측 애플리케이션과 같은 안전한 곳에 보관할 것을 강력히 권장합니다.

예를 들어, `abcdefghijklmnopqrstuvwxyz`라는 토큰을 발급받았다면 인증(authorization) 헤더를 다음과 같이 설정해야 합니다:

| 예시 | 유효성 | 설명 |
| :--- | :--- | :--- |
| `Authorization: bearer abcdefghijklmnopqrstuvwxyz` | **O (유효)** | 올바른 형식 |
| `Authorization: abcdefghijklmnopqrstuvwxyz` | **X (무효)** | `bearer` 누락 |
| `Authorization: bearer {abcdefghijklmnopqrstuvwxyz}` | **X (무효)** | 중괄호 `{}` 포함 |
| `Authorization: bearer <abcdefghijklmnopqrstuvwxyz>` | **X (무효)** | 꺾쇠괄호 `<>` 포함 |
| `Authorization: bearer{abcdefghijklmnopqrstuvwxyz}` | **X (무효)** | 공백 없음 및 중괄호 포함 |
| `Authorization: bearerabcdefghijklmnopqrstuvwxyz` | **X (무효)** | `bearer`와 토큰 사이 공백 없음 |

## API 문서
로스트아크 오픈 API 문서를 활용하면 실제 코드를 구현하기 전에 API 리소스와 상호 작용해 볼 수 있습니다. 제공되는 기능을 살펴보고 발급받은 JWT를 사용하여 실제 요청을 보낼 수 있습니다. 

항상 **"Try it out"** 버튼을 클릭하여 **"Execute"** 버튼을 활성화하세요. 이 버튼을 클릭하면 요청 설정이 완료되고, API를 호출하여 결과를 제공합니다. 로스트아크 오픈 API를 구현하기 전에 요청 매개변수를 탐색하고 응답을 확인하면 많은 시간과 노력을 절약할 수 있습니다.

## Swagger 인증
로스트아크 오픈 API 문서에서 인증하고 API를 호출하려면 다음과 같이 JWT를 전달해야 합니다:

1. **AUTHORIZE** 버튼을 클릭합니다.
2. **VALUE** 필드에 JWT를 입력합니다. (성공적인 유효성 검사를 위해 위에 제시된 잘못된 예시들을 피하시기 바랍니다.)

**사용 가능한 인증 정보:**
* **apiKeyAuth (apiKey)**: 대화형 문서와 함께 사용할 API JWT를 여기에 입력합니다. (예: `bearer JWT`)
* **Name**: `authorization`
* **In**: `header`

> **참고:** 유효한 토큰임에도 인증에 실패(unauthorized)하는 경우, 잘못된 예시를 다시 한번 확인하여 동일한 실수가 없는지 검토하세요.

## 처리율 제한 (Throttling)
클라이언트는 **분당 100회의 요청**으로 제한됩니다. 이 할당량을 초과하면 할당량이 재설정될 때까지 `429` 응답(Too Many Requests)이 반환됩니다. 할당량은 매분 자동으로 갱신되므로, 제한에 도달하더라도 1분 후에는 애플리케이션이 다시 정상적으로 작동해야 합니다.

### 응답 헤더의 Throttling 메타데이터
429 응답만 받게 되면 답답할 수 있습니다. 이를 방지하기 위해 클라이언트 애플리케이션의 요청 속도를 조절(Throttle)하세요! 아래의 메타데이터가 유용하게 쓰일 것입니다.

* `X-RateLimit-Limit` : 분당 요청 제한 수 (정수형/int)
* `X-RateLimit-Remaining` : 클라이언트가 사용할 수 있는 남은 요청 수 (정수형/int)
* `X-RateLimit-Reset` : 다음 할당량 갱신까지 남은 에포크 타임(epoch time) (long)
