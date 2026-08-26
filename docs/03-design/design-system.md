# Design System

## 방향

구매자 앱은 모바일 우선의 상담, 주문서, 결제 흐름을 끊기지 않게 보여주는 것이 우선이다. 디자인 시스템은 Figma `wihada` 파일의 `DesignSystem` 페이지에서 확인한 `Variables`, `Text Styles`, `Effect Styles`, `Component Sets / Variants`를 기준으로 한다.

Figma 파일을 기준으로 작업할 때 특정 화면을 눈으로 보고 값을 추론하지 않는다. 프론트엔드 토큰은 먼저 Figma `Semantic` variable을 사용하고, `Primitive` variable은 `Semantic`의 원천값으로만 참조한다.

## Source Of Truth

| 구분 | 기준 |
| --- | --- |
| Variable Collections | `Primitive`, `Semantic` |
| `Primitive` mode | `Value` |
| `Semantic` modes | `Mobile`, `Desktop` |
| Paint Styles | 정의 없음 |
| Text Styles | 11개 |
| Effect Styles | 4개 |
| Component Sets | 22개 |

## Not Defined

아래 항목은 Figma에 명시 정의가 없다. 구현에서 임의로 토큰이나 variant를 만들지 않는다.

- `hover` 상태 token 또는 variant
- 별도 pressed / web `:active` interaction token
- font-family variable
- font-weight variable
- letter-spacing variable
- shadow/elevation variable
- breakpoint 이름

단, layout 관련 variable로 `container/sm`, `container/md`, `container/lg`는 존재한다.

## Color Tokens

### Surface

| Token | Mobile | Desktop | Alias |
| --- | ---: | ---: | --- |
| `Color/surface/background` | `#FFFFFF` | `#FFFFFF` | `Color/gray/White` |
| `Color/surface/default` | `#FFFFFF` | `#FFFFFF` | `Color/gray/White` |
| `Color/surface/elevated` | `#FFFFFF` | `#FFFFFF` | `Color/gray/White` |
| `Color/surface/subtle` | `#F3F3F4` | `#F3F3F4` | `Color/gray/50` |
| `Color/surface/inverse` | `#12161C` | `#12161C` | `Color/gray/950` |
| `Color/surface/scrim` | `#000000/0.4` | `#000000/0.4` | `Color/alpha/black-40` |

### Text / Border / Icon

| Token | Mobile | Desktop | Alias |
| --- | ---: | ---: | --- |
| `Color/text/primary` | `#2A2E33` | `#2A2E33` | `Color/gray/900` |
| `Color/text/secondary` | `#717377` | `#717377` | `Color/gray/600` |
| `Color/text/tertiary` | `#B8B9BB` | `#B8B9BB` | `Color/gray/300` |
| `Color/text/disabled` | `#E7E8E8` | `#E7E8E8` | `Color/gray/100` |
| `Color/text/inverse` | `#FFFFFF` | `#FFFFFF` | `Color/gray/White` |
| `Color/border/default` | `#D0D0D2` | `#D0D0D2` | `Color/gray/200` |
| `Color/border/focus` | `#12161C` | `#12161C` | `Color/gray/950` |
| `Color/border/subtle` | `#F3F3F4` | `#F3F3F4` | `Color/gray/50` |
| `Color/icon/default` | `#595C60` | `#595C60` | `Color/gray/700` |
| `Color/icon/muted` | `#B8B9BB` | `#B8B9BB` | `Color/gray/300` |
| `Color/icon/disabled` | `#F3F3F4` | `#F3F3F4` | `Color/gray/50` |

### Action / Status

| Token | Mobile | Desktop | Alias |
| --- | ---: | ---: | --- |
| `Color/action/primary` | `#12161C` | `#12161C` | `Color/gray/950` |
| `Color/action/secondary` | `#717377` | `#717377` | `Color/gray/600` |
| `Color/action/subtle` | `#F3F3F4` | `#F3F3F4` | `Color/gray/50` |
| `Color/action/disabled` | `#D0D0D2` | `#D0D0D2` | `Color/gray/200` |
| `Color/action/inverse` | `#FFFFFF` | `#FFFFFF` | `Color/gray/White` |
| `Color/action/destructive` | `#EF4444` | `#EF4444` | `Color/red/500` |
| `Color/status/error` | `#EF4444` | `#EF4444` | `Color/red/500` |
| `Color/status/received/Color` | `#717377` | `#717377` | `Color/gray/600` |
| `Color/status/received/bg` | `#F3F3F4` | `#F3F3F4` | `Color/gray/50` |
| `Color/status/consulting/default` | `#F59E0B` | `#F59E0B` | `Color/yellow/500` |
| `Color/status/consulting/bg` | `#FEF5E7` | `#FEF5E7` | `Color/yellow/50` |
| `Color/status/paid/default` | `#22C55E` | `#22C55E` | `Color/green/500` |
| `Color/status/paid/bg` | `#E9F9EF` | `#E9F9EF` | `Color/green/50` |
| `Color/status/pickedup/default` | `#257AE1` | `#257AE1` | `Color/blue/500` |
| `Color/status/pickedup/bg` | `#E9F2FC` | `#E9F2FC` | `Color/blue/50` |

## Spacing / Size / Radius

| Token | Mobile | Desktop | Alias |
| --- | ---: | ---: | --- |
| `space/xs` | `4` | `4` | `scale/4` |
| `space/sm` | `8` | `8` | `scale/8` |
| `space/md` | `16` | `16` | `scale/16` |
| `space/lg` | `24` | `24` | `scale/24` |
| `space/xl` | `32` | `32` | `scale/32` |
| `space/page-margin` | `16` | `32` | `scale/16`, `scale/32` |
| `space/section` | `48` | `80` | `scale/48`, `scale/80` |
| `size/control-sm` | `36` | `32` | 없음 |
| `size/control-md` | `44` | `40` | 없음 |
| `size/control-lg` | `52` | `48` | 없음 |
| `size/icon-sm` | `16` | `16` | 없음 |
| `size/icon-md` | `20` | `20` | 없음 |
| `size/icon-lg` | `24` | `24` | 없음 |
| `radius/sm` | `12` | `12` | `radius-scale/12` |
| `radius/md` | `16` | `16` | `radius-scale/16` |
| `radius/lg` | `24` | `24` | `radius-scale/24` |
| `radius/full` | `999` | `999` | `radius-scale/Full` |
| `container/sm` | `600` | `600` | 없음 |
| `container/md` | `840` | `840` | 없음 |
| `container/lg` | `1120` | `1120` | 없음 |

## Typography

Figma Variable에는 font size와 line height 일부만 정의되어 있다. font family, weight, letter spacing은 Text Style에서 확인된 값이며 Variable은 아니다.

| Text Style | Font | Size | Line Height | Letter Spacing |
| --- | --- | ---: | ---: | ---: |
| `Display/lg` | `SUIT Bold` | `28` | `36px` | `-3%` |
| `Display/sm` | `SUIT Bold` | `22` | `30px` | `-3%` |
| `Heading/lg` | `SUIT Bold` | `20` | `28px` | `-3%` |
| `Heading/md` | `SUIT SemiBold` | `18` | `24px` | `-3%` |
| `Body/md` | `SUIT Regular` | `16` | `24px` | `-2%` |
| `Body/sm` | `SUIT Regular` | `13` | `18px` | `-1%` |
| `Label/md` | `SUIT SemiBold` | `15` | `20px` | `-2%` |
| `Label/sm` | `SUIT Medium` | `13` | `16px` | `-1%` |
| `Label/xs` | `SUIT Medium` | `11` | `16px` | `-1%` |
| `Number/lg` | `SUIT Bold` | `20` | `28px` | `-1%` |
| `Number/md` | `SUIT SemiBold` | `15` | `22px` | `-1%` |

## Effect Styles

| Effect Style | CSS |
| --- | --- |
| `shadow/card` | `0 1px 2px rgb(0 0 0 / 4%), 0 1px 3px rgb(0 0 0 / 6%)` |
| `shadow/dropdown` | `0 8px 24px rgb(0 0 0 / 12%)` |
| `shadow/modal` | `0 -12px 12px rgb(0 0 0 / 4%)` |
| `border/image-inset` | `inset 0 0 0 0.5px rgb(0 0 0 / 10%)` |

## Components

Component Set과 Variant property는 다음을 기준으로 한다.

| Component | Variant / Properties |
| --- | --- |
| `Button` | `Size=Sm/Md/Lg`, `Status=Disabled/Default/Active`, `Text#421:53` |
| `InputArea` | `Status=Default/Active` |
| `TimeChip` | `Status=Disabled/Active/Default`, `Time#421:63` |
| `cell` | `Status=Default/Disabled/Active`, `Date#427:67`, `Show#427:70` |
| `PickupState` | `Status=Consulting/Pickup/Paid/Received` |
| `Tab` | `Status=Default/Active` |
| `Checkbox` | `Status=false/true` |
| `Radio` | `Status=True/False` |
| `Header` | `Layout=Home_M/Home_D/Default/Side`, `Left#259:4`, `Right#416:28`, `Title#416:23` |
| `CtaArea` | `Layout=Split/Stacked/Add`, `Secondary#427:75` |
| `NoticeAccordion` | `Expanded=False/True`, `Title#416:20` |
| `NoticeBox` | `Type=Default/Filled` |
| `OptionRow` | `Layout=Default/Text/Image`, `Label#416:35`, `Value#416:36`, `ShowNote#416:37`, `Note#416:42` |
| `Pickup-Time` | `Status=Confirmed/Editable` |
| `BubbleArea` | `type=store/buyer`, `time#481:79`, `Profile#481:82`, `Read#569:106` |
| `bubble` | `type=store/buyer/receipt/payment/type5`, `Text#481:85` |
| `AgreeArea` | `Status=False/True` |
| `Bell` | `Status=Default/Unread` |
| `Border` | `Type=md/sm` |
| `Logo` | `Status=Symbol/Wordmark` |
| `StoreProfile` | `Type=Image/Default` |
| `Title` | `Type=Default/Number/BtmSheet/Sidebar/Price`, `Size=Lg/Sm/Xl` |

## Implementation Rules

- `src/app/globals.css`는 `--figma-*` 토큰을 원본 기준 레이어로 둔다.
- 기존 화면이 참조하는 legacy 변수명은 `--figma-*` 토큰 alias로만 유지한다.
- 신규 컴포넌트는 `--figma-*` 또는 semantic alias를 사용하고 HEX를 직접 반복하지 않는다.
- `Status=Active`는 Figma 선택/활성 variant로만 해석한다. web pressed state로 임의 해석하지 않는다.
- `hover` 스타일은 Figma에 정의되어 있지 않으므로 신규 구현에서 임의 생성하지 않는다.
- `InputArea`에는 `Error` variant가 없으므로 `Color/status/error`는 에러 표현 token으로만 사용하고, variant 추가는 디자인 확정 후 진행한다.
- Figma에 누락된 로딩, 빈 상태, 오류, 결과 확인 필요, 이미지 없음 상태는 구현에서 제거하지 않는다.
