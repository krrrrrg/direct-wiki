export const GUIDE_DATA = {
  categories: [
    {
      id: 'terminal',
      title: '단말기 / 결제',
      icon: '\u{1F4B3}',
      desc: '결제 오류, 영수증, 단말기 설정',
      color: '#3182f6',
      gradient: 'linear-gradient(135deg, #3182f6, #6db0ff)',
      notice: '본 가이드는 대다수 매장에서 사용하는 단말기를 기준으로 작성되었습니다. 매장별로 버튼 모양이나 위치가 다를 수 있으나 의미와 기능은 동일합니다. 어려우시면 경영지원팀에 문의해주세요.',
      guides: [
        {
          id: 'long-receipt',
          title: '긴 영수증이 안 나와요',
          symptom: '결제 후 긴 영수증(상세 영수증)이 출력되지 않는 경우',
          keywords: ['긴영수증', '영수증 안나옴', '영수증 출력', '상세영수증'],
          shortcut: '0 > 1 > 0 > 1',
          steps: [
            { action: '0(용지) 버튼 누르기', detail: '단말기 기본 화면에서 숫자 0번(용지)을 눌러주세요', image: '/images/단말기-결제오류/긴영수증/step1.jpg' },
            { action: '1 버튼 누르기', detail: '메뉴 화면에서 1번을 선택해주세요', image: '/images/단말기-결제오류/긴영수증/step2.jpg' },
            { action: '다시 0 버튼 누르기', detail: '다음 메뉴에서 다시 0번을 눌러주세요', image: '/images/단말기-결제오류/긴영수증/step3.jpg' },
            { action: '1 버튼 누르기', detail: '설정이 완료됩니다. 이후 긴 영수증이 정상 출력됩니다.', image: '/images/단말기-결제오류/긴영수증/step4.jpg' },
          ],
          note: '설정 후에도 긴 영수증이 나오지 않으면 단말기 전원을 껐다가 다시 켜주세요.'
        },
        {
          id: 'host-receipt',
          title: '호스트 영수증 출력',
          symptom: '마감할 때 아마란스 매장방에 올릴 호스트 영수증 출력 방법',
          keywords: ['호스트', '마감 영수증', '집계', '정산'],
          shortcut: '3 > 1 > 0 > 입력 2번',
          steps: [
            { action: '3 버튼 누르기', detail: '기본 화면에서 숫자 3번(정산)을 눌러주세요', image: '/images/단말기-결제오류/호스트영수증/step1.jpg' },
            { action: '1 버튼 (호스트)', detail: '정산거래 선택에서 호스트[1]를 선택해주세요', image: '/images/단말기-결제오류/호스트영수증/step2.jpg' },
            { action: '0 버튼 (신용정산)', detail: '정산종류에서 신용정산[0]을 선택해주세요', image: '/images/단말기-결제오류/호스트영수증/step3.jpg' },
            { action: '입력 버튼 2번', detail: '날짜 확인 화면에서 입력 버튼을 2번 눌러주세요', image: '/images/단말기-결제오류/호스트영수증/step4.jpg' },
            { action: '영수증 확인', detail: '호스트 영수증이 출력됩니다. 아마란스 매장방에 올려주세요.', image: '/images/단말기-결제오류/호스트영수증/step5.jpg' },
          ],
          note: '매일 마감 시 반드시 이 영수증을 출력하여 아마란스 매장방에 올려야 합니다!'
        },
        {
          id: 'receipt-setting',
          title: '"영수증 출력 확인" 메시지',
          symptom: '결제 후 "영수증 출력 확인" 메시지가 뜨면서 영수증이 자동으로 나오지 않는 경우',
          keywords: ['영수증 출력 확인', '영수증 세팅', '자동출력'],
          shortcut: '0 > 0 > 000',
          steps: [
            { action: '0 버튼 누르기', detail: '기본 화면에서 숫자 0번을 눌러주세요', image: '/images/단말기-결제오류/영수증세팅/step1.jpg' },
            { action: '다시 0 버튼 누르기', detail: '다음 메뉴에서 다시 0번을 눌러주세요', image: '/images/단말기-결제오류/영수증세팅/step2.jpg' },
            { action: '000 입력', detail: '숫자 0을 세 번(000) 입력해주세요. 영수증 출력 세팅이 완료됩니다.', image: '/images/단말기-결제오류/영수증세팅/step3.jpg' },
          ],
          note: '이 설정은 전 직영점 통일 세팅입니다. 한 번 설정하면 계속 유지됩니다.'
        },
        {
          id: 'cat-error',
          title: 'CAT 단말기 연결 오류',
          symptom: '"CAT 단말기 연결이 안됩니다" 또는 돌핀POS에서 결제 오류 화면이 나타나는 경우',
          keywords: ['CAT', '연결 안됨', '결제 안됨', '결제오류'],
          shortcut: null,
          steps: [
            { action: '오류 화면 확인', detail: '아래와 같은 오류 화면이 나타났다면 다음 단계를 따라해주세요.', image: '/images/단말기-결제오류/결제오류/step1.jpg' },
            { action: '종료 버튼 누르기', detail: '오류 팝업의 종료 버튼을 눌러 기본 화면으로 돌아가주세요.', image: '/images/단말기-결제오류/결제오류/step2.jpg' },
            { action: 'KSCAT 프로그램 실행', detail: '컴퓨터 바탕화면에 있는 KSCAT 아이콘을 더블클릭해서 실행해주세요.\n프로그램이 실행되면 단말기가 다시 연결됩니다.', image: null },
            { action: '다시 결제 진행', detail: 'KSCAT 실행 후 돌핀POS 기본 화면으로 돌아오면 정상적으로 결제가 가능합니다.', image: null },
          ],
          note: 'KSCAT 실행 후에도 연결이 안 되면, 단말기 전원 코드를 뽑았다가 10초 후 다시 꽂아주세요.'
        },
        {
          id: 'inventory',
          title: '재고 출력이 안 돼요',
          symptom: '재고관리에서 재고 출력 기능이 동작하지 않는 경우',
          keywords: ['재고', '재고출력', '재고관리'],
          shortcut: null,
          steps: [
            { action: '박규영 매니저에게 쪽지 보내기', detail: '아마란스 메신저에 접속하여 박규영 매니저님에게 쪽지로 상황을 알려주세요.', image: null },
          ],
          note: '재고 출력 문제는 매장에서 직접 해결할 수 없습니다. 반드시 박규영 매니저님에게 연락해주세요!'
        }
      ]
    },
    {
      id: 'closing',
      title: '오픈 / 마감',
      icon: '\u{1F504}',
      desc: '시재금액, 시재마감, 비용등록, 재오픈',
      color: '#00c473',
      gradient: 'linear-gradient(135deg, #00c473, #5de7a0)',
      guides: [
        {
          id: 'initial-cash',
          title: '초기 시재금액 입력',
          symptom: '오픈 시 매장에 보유 중인 시재 현금을 입력하는 방법',
          keywords: ['시재금액', '초기시재', '오픈', '현금입력', '시재'],
          shortcut: null,
          steps: [
            { action: '권종별 수량 입력', detail: '오픈 시 시재금액 입력 화면이 나타납니다. 매장에 실제로 보유 중인 현금을 권종별(오만원권, 만원권 등)로 입력해주세요.', image: '/images/오픈-마감/초기시재금액/step1.png' },
            { action: '총액 확인 후 시작하기', detail: '입력한 권종별 수량이 맞는지 총액을 확인한 뒤 "시작하기" 버튼을 눌러주세요.', image: '/images/오픈-마감/초기시재금액/step2.png' },
          ],
          note: '매장에 실제로 보유 중인 시재 현금을 기준으로 입력해야 합니다.'
        },
        {
          id: 'closing-cash',
          title: '시재마감 하는 법',
          symptom: '영업 종료 후 시재마감을 진행하는 방법',
          keywords: ['시재마감', '마감', '영업종료', '마감방법'],
          shortcut: null,
          steps: [
            { action: '시재마감 버튼 클릭', detail: '하단 메뉴에서 "시재마감" 버튼을 눌러주세요.', image: '/images/오픈-마감/시재마감/step1.png' },
            { action: '마감금액 입력', detail: '현재 매장에 남아있는 시재 현금 금액을 입력해주세요.', image: null },
            { action: '등록 버튼 클릭', detail: '금액 확인 후 "등록" 버튼을 눌러 마감을 완료합니다.', image: null },
          ],
          note: null
        },
        {
          id: 'expense-register',
          title: '비용등록 하는 법',
          symptom: '매장 운영 비용(교통비, 소모품 등)을 등록하는 방법',
          keywords: ['비용등록', '비용', '지출', '경비', '영수증'],
          shortcut: null,
          steps: [
            { action: '비용등록 메뉴 선택', detail: '하단 메뉴에서 비용등록을 선택해주세요.', image: '/images/오픈-마감/비용등록/step1.png' },
            { action: '금액 입력 및 영수증 첨부', detail: '날짜와 지출구분을 선택하고, 금액과 사유를 입력한 뒤 영수증을 첨부하고 "비용 등록" 버튼을 눌러주세요.', image: '/images/오픈-마감/비용등록/step2.png' },
          ],
          note: '당일 시재 마감 시에만 등록 가능합니다. 마감 후에는 수정이 불가하니 주의하세요!'
        },
        {
          id: 'reopen',
          title: '마감 후 손님이 왔을 때',
          symptom: '시재마감 이후 손님이 도착하여 다시 결제를 해야 하는 경우',
          keywords: ['마감', '재오픈', '마감 후', '손님', '시재마감'],
          shortcut: null,
          steps: [
            { action: '시재마감 상태 확인', detail: '현재 마감이 완료된 상태인지 확인합니다.', image: '/images/마감-재오픈/step1.jpg' },
            { action: '손님 도착 상황', detail: '시재마감 이후 손님이 도착한 상황입니다.', image: '/images/마감-재오픈/step2.jpg' },
            { action: '재오픈 진행', detail: '돌핀POS에서 재오픈 버튼을 눌러주세요.', image: '/images/마감-재오픈/step3.jpg' },
            { action: '결제 진행', detail: '정상적으로 결제를 진행합니다.', image: '/images/마감-재오픈/step4.jpg' },
            { action: '다시 마감', detail: '결제 완료 후 다시 시재마감을 진행해주세요.', image: '/images/마감-재오픈/step5.jpg' },
          ],
          note: '재오픈 후에는 반드시 다시 마감을 진행해야 합니다!'
        }
      ]
    },
    {
      id: 'payment',
      title: 'POS 결제',
      icon: '\u{1F4B3}',
      desc: '카드, 현금, 이체, 복합결제, 환불',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4, #7ee8e2)',
      notice: '결제 진행 전 상품이 정상적으로 등록되었는지 확인해주세요.',
      guides: [
        {
          id: 'card-payment',
          title: '카드결제 방법',
          symptom: '돌핀POS에서 카드로 결제하는 방법',
          keywords: ['카드결제', '카드', '할부', '결제'],
          shortcut: null,
          steps: [
            { action: '할부 기간 설정 (필요 시)', detail: '할부 개월 수 요청 시 해당 영역에서 기간을 설정해주세요. 일시불이면 그대로 두면 됩니다.', image: '/images/POS-결제/카드결제/step1.png' },
            { action: '메모 입력 (선택)', detail: '메모를 입력하면 결제 시 메모도 같이 저장됩니다.', image: null },
            { action: '카드 결제 버튼 클릭', detail: '우측 하단의 카드 결제 버튼을 눌러 결제를 완료합니다.', image: null },
          ],
          note: null
        },
        {
          id: 'cash-payment',
          title: '현금결제 방법',
          symptom: '돌핀POS에서 현금으로 결제하는 방법',
          keywords: ['현금결제', '현금', '현금영수증', '자진발급'],
          shortcut: null,
          steps: [
            { action: '현금영수증 미발행 시', detail: '기본값 상태에서 "현금" 버튼을 눌러 결제를 완료합니다.', image: '/images/POS-결제/현금결제/step1.png' },
            { action: '현금영수증 발행 시', detail: '현금영수증번호를 입력한 뒤 결제를 진행해주세요.', image: '/images/POS-결제/현금결제/step2.png' },
          ],
          note: '10만원 이상 결제 시에는 반드시 "자진 발급" 버튼을 누른 후 결제완료 버튼을 누릅니다.'
        },
        {
          id: 'transfer-payment',
          title: '이체 결제 방법',
          symptom: '돌핀POS에서 이체로 결제하는 방법',
          keywords: ['이체', '이체결제', '계좌이체'],
          shortcut: null,
          steps: [
            { action: '현금영수증 자진 발급 시', detail: '기본값 상태에서 "이체" 버튼을 눌러 결제를 완료합니다.', image: '/images/POS-결제/이체/step1.png' },
            { action: '현금영수증 발행 시', detail: '현금영수증번호를 입력한 뒤 결제를 진행해주세요.', image: '/images/POS-결제/이체/step2.png' },
          ],
          note: '10만원 이상 결제 시에는 반드시 "자진 발급" 버튼을 누른 후 결제완료 버튼을 누릅니다.'
        },
        {
          id: 'mixed-payment',
          title: '복합결제 방법',
          symptom: '카드+현금 등 여러 수단을 조합하여 결제하는 방법',
          keywords: ['복합결제', '분할결제', '카드+현금', '나눠서'],
          shortcut: null,
          steps: [
            { action: '1차 결제 금액 입력', detail: '먼저 1차적으로 결제할 금액을 입력해주세요.', image: '/images/POS-결제/복합결제/step1.png' },
            { action: '1차 결제 수단 선택 및 남은 금액 결제', detail: '1차로 결제할 수단(카드/현금/이체)을 선택합니다. 남은 결제 금액 중 다음으로 결제할 금액을 입력하고 결제 수단을 선택합니다. 남은 결제 금액이 0원이 될 때까지 반복합니다.', image: '/images/POS-결제/복합결제/step2.png' },
          ],
          note: '남은 결제 금액이 0원이 아닐 시, 다른 작업을 진행하지 마세요.'
        },
        {
          id: 'approved-register',
          title: '승인 후 등록 (카드 오류 시)',
          symptom: '카드결제 오류 시 승인 후 등록으로 결제를 처리하는 방법',
          keywords: ['승인 후 등록', '카드오류', '수동결제', '승인후등록'],
          shortcut: null,
          steps: [
            { action: '승인 후 등록 버튼 클릭', detail: '하단 결제 영역에서 "승인 후 등록" 버튼을 눌러주세요.', image: '/images/POS-결제/승인후등록/step1.png' },
            { action: '카드 결제 정보 입력', detail: '카드 결제 팝업에서 승인번호, 결제 금액 등 정보를 입력한 뒤 등록합니다.', image: null },
          ],
          note: '카드결제 오류 시에만 사용하세요. 정상 결제가 가능하면 일반 카드결제를 이용해주세요.'
        },
        {
          id: 'new-payment-method',
          title: '신규 결제 수단 (지역화폐 등)',
          symptom: 'QR 지역화폐 등 신규 결제 수단으로 결제하는 방법',
          keywords: ['지역화폐', '신규결제', 'QR결제', '결제수단'],
          shortcut: null,
          steps: [
            { action: '승인 후 등록 버튼 클릭', detail: '하단 결제 영역에서 "승인 후 등록" 버튼을 눌러주세요.', image: '/images/POS-결제/신규결제수단/step1.png' },
            { action: '결제 수단에서 지역화폐 선택', detail: '결제 수단 목록에서 해당 지역화폐를 선택하고 결제 정보를 입력합니다.', image: null },
          ],
          note: 'QR로 지역화폐 결제 시 승인 후 등록에서 결제 정보를 등록해야 합니다.'
        },
        {
          id: 'pos-refund',
          title: '환불 방법',
          symptom: '결제 완료된 건을 환불 처리하는 방법',
          keywords: ['환불', '취소', '결제취소', '반품'],
          shortcut: null,
          steps: [
            { action: '통합조회에서 내역 조회', detail: '통합조회 화면에서 환불할 결제 내역을 검색합니다.', image: '/images/POS-결제/환불/step1.png' },
            { action: '환불 처리', detail: '환불하려는 주문을 선택 후 더블클릭하고, 우측의 "환불" 버튼을 눌러 환불을 완료합니다.', image: '/images/POS-결제/환불/step2.png' },
          ],
          note: null
        }
      ]
    },
    {
      id: 'hakacare',
      title: '하카케어',
      icon: '\u{1F6E1}',
      desc: '분실케어, 보상판매, 에코멤버십',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4, #7ee8e2)',
      notice: '하카케어 서비스는 고객님이 CAT단말기 또는 키보드로 휴대폰 번호 뒤 4자리를 직접 입력합니다.',
      guides: [
        {
          id: 'lost-care',
          title: '분실케어',
          symptom: '분실케어 대상 고객에게 재구매 할인을 제공하는 방법',
          keywords: ['분실케어', '분실', '재구매', '할인'],
          shortcut: null,
          steps: [
            { action: '분실케어 메뉴 선택', detail: '하단 메뉴에서 "분실케어"를 선택해주세요.', image: '/images/하카케어/분실케어/step1.png' },
            { action: '고객 번호 입력 및 제품 선택', detail: '고객님이 CAT단말기로 휴대폰 번호 뒤 4자리를 입력합니다. (키보드로도 입력 가능) 고객님께 확인 후 분실한 제품을 선택해주세요.', image: '/images/하카케어/분실케어/step2.png' },
            { action: '결제 진행', detail: '할인이 적용된 금액으로 결제를 진행합니다.', image: null },
          ],
          note: null
        },
        {
          id: 'trade-in',
          title: '보상판매',
          symptom: '타사 기기 반납 시 할인을 적용하는 방법',
          keywords: ['보상판매', '타사', '반납', '보상'],
          shortcut: null,
          steps: [
            { action: '보상판매 메뉴 선택', detail: '하단 메뉴에서 "보상판매"를 선택해주세요.', image: '/images/하카케어/보상판매/step1.png' },
            { action: '고객 번호 입력 및 제품 선택', detail: '고객님이 CAT단말기로 휴대폰 번호 뒤 4자리를 입력합니다. 고객 정보를 확인하고 해당 제품을 선택합니다.', image: '/images/하카케어/보상판매/step2.png' },
            { action: '결제 진행', detail: '보상 할인이 적용된 금액으로 결제를 진행합니다.', image: null },
          ],
          note: null
        },
        {
          id: 'eco-membership',
          title: '에코멤버십',
          symptom: '사용 중 기기 외 제품 구매 시 할인을 적용하는 방법',
          keywords: ['에코멤버십', '에코', '멤버십', '기기외'],
          shortcut: null,
          steps: [
            { action: '에코멤버십 메뉴 선택', detail: '하단 메뉴에서 "에코멤버십"을 선택해주세요.', image: '/images/하카케어/에코멤버십/step1.png' },
            { action: '고객 번호 입력 및 제품 선택', detail: '고객님이 CAT단말기로 휴대폰 번호 뒤 4자리를 입력합니다. 이용 중인 제품을 확인하고 선택합니다.', image: '/images/하카케어/에코멤버십/step2.png' },
            { action: '결제 진행', detail: '에코멤버십 할인이 적용된 금액으로 결제를 진행합니다.', image: null },
          ],
          note: null
        }
      ]
    },
    {
      id: 'registration',
      title: '등록 및 서비스',
      icon: '\u{1F4CB}',
      desc: '레드라벨, 정품등록, A/S, 교환, 이벤트',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4, #7ee8e2)',
      guides: [
        {
          id: 'red-label',
          title: '레드라벨 등록',
          symptom: '레드라벨 팟 구매 고객의 정보를 등록하는 방법',
          keywords: ['레드라벨', '팟', '고객등록', '레드'],
          shortcut: null,
          steps: [
            { action: '레드라벨 메뉴 선택', detail: '하단 메뉴에서 "레드라벨"을 선택해주세요.', image: '/images/등록-서비스/레드라벨/step1.png' },
            { action: '제품 바코드 스캔 및 고객조회', detail: '제품 바코드를 스캔하고, 고객님이 CAT단말기로 번호를 입력합니다.', image: '/images/등록-서비스/레드라벨/step2.png' },
            { action: '신규 고객 가입 (필요 시)', detail: '신규 고객이면 고객 정보를 입력 후 등록합니다.', image: '/images/등록-서비스/레드라벨/step3.png' },
            { action: '등록 완료', detail: '고객 정보 확인 후 등록을 완료합니다.', image: '/images/등록-서비스/레드라벨/step4.png' },
          ],
          note: '레드라벨 제품은 결제 후 등록이 가능합니다. 고객정보 등록 완료 후 레드라벨 등록 절차를 진행하면 됩니다.'
        },
        {
          id: 'genuine-register',
          title: '정품등록',
          symptom: '구매 기기의 정품등록을 진행하는 방법',
          keywords: ['정품등록', '정품', '기기등록', '워런티'],
          shortcut: null,
          steps: [
            { action: '정품등록 메뉴 선택', detail: '하단 메뉴에서 "정품등록"을 선택해주세요.', image: '/images/등록-서비스/정품등록/step1.png' },
            { action: '기존 고객: 배송 리스트 선택 및 등록', detail: '해당 제품의 배송 리스트를 선택하고, 등록 비밀번호를 입력 후 등록합니다.', image: '/images/등록-서비스/정품등록/step2.png' },
            { action: '신규 고객: 고객 정보 입력', detail: '신규 고객이면 고객 정보를 입력해주세요.', image: '/images/등록-서비스/정품등록/step3.png' },
            { action: '고객 확인 후 등록 완료', detail: '고객님 확인 메세지 내용 확인 후 등록을 완료합니다.', image: '/images/등록-서비스/정품등록/step4.png' },
          ],
          note: '정품등록 항목은 결제 완료 후에 노출됩니다.'
        },
        {
          id: 'pos-as',
          title: 'A/S 등록',
          symptom: '정품등록된 제품의 A/S를 접수하는 방법',
          keywords: ['AS', 'A/S', '수리', '불량', '교환', 'AS등록'],
          shortcut: null,
          steps: [
            { action: 'A/S 메뉴 선택 및 고객 번호 입력', detail: '하단 메뉴에서 "A/S"를 선택하고, 고객님이 CAT단말기로 휴대폰 번호 뒤 4자리를 입력합니다.', image: '/images/등록-서비스/AS/step1.png' },
            { action: '제품 확인 및 A/S 등록', detail: '고객님의 제품을 확인하고, 해당하는 불량 증상을 선택한 뒤 "A/S 등록" 버튼을 눌러 접수를 완료합니다.', image: '/images/등록-서비스/AS/step2.png' },
          ],
          note: null
        },
        {
          id: 'pos-exchange',
          title: '교환 방법',
          symptom: '동일 제품 간 교환을 처리하는 방법',
          keywords: ['교환', '동일교환', '제품교환'],
          shortcut: null,
          steps: [
            { action: '통합조회에서 기존 제품 선택', detail: '통합조회 화면에서 교환할 결제 내역을 검색하고, 기존 제품을 담은 후 체크박스를 선택해주세요.', image: '/images/등록-서비스/교환/step1.png' },
            { action: '교환할 상품 담기 및 교환 완료', detail: '교환하고자 하는 새 상품을 담고 "교환하기" 버튼을 눌러 교환을 완료합니다.', image: '/images/등록-서비스/교환/step2.png' },
          ],
          note: '교환은 같은 금액만 가능합니다.'
        },
        {
          id: 'pos-event',
          title: '이벤트 제품 결제',
          symptom: '이벤트 제품을 결제하는 방법',
          keywords: ['이벤트', '이벤트결제', '프로모션'],
          shortcut: null,
          steps: [
            { action: '이벤트 메뉴 선택', detail: '하단 메뉴에서 "이벤트"를 선택해주세요.', image: '/images/등록-서비스/이벤트/step1.png' },
            { action: '판매자 페이지에서 이벤트 등록', detail: '이벤트 등록은 판매자 페이지에서 진행됩니다. 안내에 따라 진행해주세요.', image: '/images/등록-서비스/이벤트/step2.png' },
          ],
          note: '해당 기능은 현재 개발 중이며, 이벤트 등록은 판매자 페이지에서 진행 부탁드립니다.'
        }
      ]
    },
    {
      id: 'inquiry',
      title: 'POS 조회',
      icon: '\u{1F50D}',
      desc: '재고, 입고, 통합조회, 판매보류',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4, #7ee8e2)',
      guides: [
        {
          id: 'stock-management',
          title: '재고관리 / 재고 출력',
          symptom: '현재 매장 재고를 확인하고 내역을 출력하는 방법',
          keywords: ['재고관리', '재고확인', '재고출력', '재고조회'],
          shortcut: null,
          steps: [
            { action: '재고관리 메뉴 선택', detail: '하단 메뉴에서 "재고관리"를 선택하면 현재 매장 재고 현황이 표시됩니다.', image: '/images/POS-조회/재고관리/step1.png' },
            { action: '재고 출력', detail: '"재고 출력" 버튼을 누르면 재고 내역이 출력됩니다.', image: null },
          ],
          note: null
        },
        {
          id: 'receiving-management',
          title: '입고관리 / 입고 승인',
          symptom: '입고 내역을 확인하고 입고 승인을 진행하는 방법',
          keywords: ['입고관리', '입고', '입고승인', '입고확인'],
          shortcut: null,
          steps: [
            { action: '입고관리 메뉴에서 전표 선택', detail: '입고관리 화면에서 확인할 전표 리스트를 선택합니다.', image: '/images/POS-조회/입고관리/step1.png' },
            { action: '입고확인 및 수량 입력', detail: '내역을 확인한 뒤 "입고확인" 버튼을 눌러주세요. 실제고 수량 입력도 가능합니다.', image: '/images/POS-조회/입고관리/step2.png' },
          ],
          note: null
        },
        {
          id: 'total-inquiry',
          title: '통합조회',
          symptom: '매출, 카드, 날짜별 등 다양한 내역을 조회하는 방법',
          keywords: ['통합조회', '매출조회', '내역조회', '카드조회', '날짜조회'],
          shortcut: null,
          steps: [
            { action: '조건 설정', detail: '조회 항목(매출/카드/날짜 등)을 선택하고 기간을 설정합니다.', image: '/images/POS-조회/통합조회/step1.png' },
            { action: '조회 결과 확인', detail: '설정한 조건에 맞는 결과가 표시됩니다. 상세 내역을 클릭하면 세부 정보를 확인할 수 있습니다.', image: '/images/POS-조회/통합조회/step2.png' },
          ],
          note: null
        },
        {
          id: 'sales-hold',
          title: '판매보류 / 보류조회',
          symptom: '결제예정 내역을 보류하고, 보류된 건을 조회하는 방법',
          keywords: ['판매보류', '보류', '보류조회', '보류목록'],
          shortcut: null,
          steps: [
            { action: '판매보류 버튼 클릭', detail: '결제 화면에서 "판매보류" 버튼을 누르면 현재 건이 보류됩니다.', image: '/images/POS-조회/판매보류/step1.png' },
            { action: '보류목록 조회 및 결제 진행', detail: '"보류목록 조회" 메뉴에서 보류된 건들을 확인하고, 더블클릭하면 상세 화면으로 이동하여 결제를 진행할 수 있습니다.', image: '/images/POS-조회/판매보류/step2.png' },
          ],
          note: null
        }
      ]
    },
    {
      id: 'setup',
      title: '로그인 및 바코드 설정',
      icon: '\u{2699}',
      desc: '최초 로그인, 바코드 스캐너 설정',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4, #7ee8e2)',
      guides: [
        {
          id: 'first-login',
          title: '최초 로그인 방법',
          symptom: '돌핀POS 최초 실행 시 바코드 스캐너 설정 및 로그인 방법',
          keywords: ['로그인', '최초', '매장 인증', '직원 로그인', '바코드 스캐너', '최초설정', '스캐너'],
          shortcut: null,
          steps: [
            { action: '바코드 스캐너 설정', detail: '돌핀POS를 처음 실행하면 바코드 스캐너 설정 화면이 나타납니다. STEP 1의 설정 바코드와 STEP 2의 확인 바코드를 순서대로 바코드 리더기로 스캔해주세요. 정상적으로 완료되면 5초 이내에 자동으로 로그인 화면으로 넘어갑니다.', image: '/images/로그인-바코드/최초로그인/step1.jpg' },
            { action: '매장 인증', detail: '매장 아이디와 비밀번호를 입력한 뒤 "매장 인증" 버튼을 눌러주세요. 자동로그인에 체크하면 다음부터 자동으로 로그인됩니다.', image: '/images/로그인-바코드/최초로그인/step2.jpg' },
            { action: '직원 로그인', detail: '매장 인증이 완료되면 직원 로그인 화면이 나타납니다. 직원 아이디와 비밀번호를 입력하고 "POS 로그인" 버튼을 눌러주세요.', image: '/images/로그인-바코드/최초로그인/step3.jpg' },
          ],
          note: '최초 로그인하신 매장은 자동으로 매장 로그인이 되어있어 직원 아이디만 로그인하시면 됩니다.'
        },
        {
          id: 'barcode-not-reading',
          title: '바코드가 인식 안 될 때',
          symptom: '바코드 리더기로 찍어도 인식이 되지 않는 경우',
          keywords: ['바코드', '인식 안됨', '바코드 안됨', 'KSCAT', '서비스 시작', '리더기'],
          shortcut: null,
          steps: [
            { action: 'KSCAT 프로그램 실행 확인', detail: '컴퓨터 바탕화면에 있는 KSCAT 아이콘을 더블클릭해서 실행해주세요.', image: '/images/최초설정/바코드인식/step1.jpg' },
            { action: '시스템 트레이 확인', detail: '컴퓨터 시계 옆 위쪽 방향 화살표(^)를 클릭하여 KSCAT 프로그램이 실행 중인지 확인해주세요.', image: '/images/최초설정/바코드인식/step2.jpg' },
            { action: '서비스 시작 버튼 누르기', detail: 'KSCAT 프로그램 화면 하단의 "서비스 시작" 버튼을 눌러주세요. 이미 눌러져 있다면 바코드가 정상 인식됩니다.', image: '/images/최초설정/바코드인식/step3.jpg' },
          ],
          note: '서비스 시작을 눌렀는데도 바코드가 인식되지 않으면 경영지원팀에 문의해주세요.'
        }
      ]
    },
    {
      id: 'update',
      title: '업데이트 및 동기화',
      icon: '\u{1F504}',
      desc: 'POS 업데이트, 데이터 동기화',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4, #7ee8e2)',
      guides: [
        {
          id: 'pos-update',
          title: '돌핀POS 업데이트 하는 법',
          symptom: '업데이트 공지가 내려왔을 때 POS 업데이트 방법',
          keywords: ['업데이트', '돌핀', '동기화', 'POS 업데이트', '버전'],
          shortcut: null,
          steps: [
            { action: '돌핀POS 프로그램 종료 후 다시 실행', detail: '실행 중인 돌핀POS를 완전히 종료한 뒤, 바탕화면의 haka dolphine pos 아이콘을 더블클릭하여 다시 실행해주세요.', image: '/images/업데이트-동기화/업데이트/step1.jpg' },
            { action: '"업데이트 하시겠습니까?" → 예 클릭', detail: '프로그램 실행 시 업데이트 확인 팝업이 나타납니다. "예"를 클릭해주세요.', image: '/images/업데이트-동기화/업데이트/step2.jpg' },
            { action: '업데이트 다운로드 후 로그인', detail: '업데이트 다운로드가 완료되면 자동으로 프로그램이 다시 시작됩니다. 정상적으로 로그인해주세요.', image: '/images/업데이트-동기화/업데이트/step3.jpg' },
          ],
          note: '업데이트 중 프로그램을 강제 종료하지 마세요. 다운로드가 완료될 때까지 기다려주세요.'
        },
        {
          id: 'pos-sync',
          title: '데이터 동기화 하는 법',
          symptom: '재고 변경/입고 후 반영이 안 되거나, 결제건 수정 후 반영이 안 되는 경우',
          keywords: ['동기화', '재고 반영', '입고', '결제건 수정', '반영 안됨', '데이터'],
          shortcut: null,
          steps: [
            { action: '하단 설정 탭 진입', detail: '돌핀POS 화면 하단의 "설정" 버튼을 눌러주세요.', image: '/images/업데이트-동기화/동기화/step1.jpg' },
            { action: '동기화 버튼 누르기', detail: '설정 화면에서 "동기화" 버튼을 눌러주세요. 최신 데이터를 서버에서 받아옵니다.', image: null },
            { action: '프로그램 재실행', detail: '동기화 완료 후 돌핀POS를 종료하고 다시 실행해주세요. 변경된 재고 및 결제 정보가 반영됩니다.', image: null },
          ],
          note: '재고 변경/입고 시 재고 반영, 결제건 수정 후 반영이 안 될 때 동기화를 진행해주세요.'
        }
      ]
    },
    {
      id: 'signature',
      title: '시그니처 이벤트 적용',
      icon: '\u{1F3AF}',
      desc: '시그니처 프로모션 이벤트 할인 적용',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4, #7ee8e2)',
      guides: [
        {
          id: 'signature-event',
          title: '시그니처 이벤트 적용하는 법',
          symptom: '시그니처 프로모션 이벤트 할인 적용 방법',
          keywords: ['시그니처', '이벤트', '프로모션', '할인', '시그니처 이벤트'],
          shortcut: null,
          steps: [
            { action: '시그니처 제품 바코드 인식', detail: '판매할 시그니처 제품의 바코드를 스캔하여 상품을 등록해주세요.', image: null },
            { action: '판매유형에서 "전국 시그니처 프로모션 이벤트" 선택', detail: '상품 등록 후 판매유형 드롭다운을 클릭하여 "전국 시그니처 프로모션 이벤트"를 선택해주세요.', image: '/images/업데이트-동기화/시그니처이벤트/step2.jpg' },
            { action: '적용 확인 후 계산', detail: '할인 금액이 정상적으로 적용되었는지 확인한 뒤 결제를 진행해주세요.', image: '/images/업데이트-동기화/시그니처이벤트/step3.jpg' },
          ],
          note: '팟이 아닌 시그니처 기기에 반드시 찍어주셔야 합니다.'
        }
      ]
    },
    {
      id: 'display',
      title: '화면 / 디스플레이',
      icon: '\u{1F5A5}',
      desc: 'POS 화면 짤림, 디스플레이 설정',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4, #7ee8e2)',
      guides: [
        {
          id: 'screen-cut',
          title: 'POS 화면이 짤려서 보일 때',
          symptom: '돌핀POS 화면이 잘리거나 일부가 보이지 않는 경우',
          keywords: ['화면 짤림', '화면 잘림', '디스플레이', '배율', '해상도', '100%'],
          shortcut: null,
          steps: [
            { action: '바탕화면 우클릭 → 디스플레이 설정', detail: '컴퓨터 바탕화면의 빈 공간에서 마우스 우클릭 후 "디스플레이 설정"을 클릭해주세요.', image: '/images/화면설정/화면짤림/step1.jpg' },
            { action: '배율 및 레이아웃 → 100% 선택', detail: '"배율 및 레이아웃" 항목에서 배율을 100%로 변경해주세요. 125%나 150%로 되어 있으면 화면이 짤릴 수 있습니다.', image: '/images/화면설정/화면짤림/step2.jpg' },
            { action: '돌핀POS 재실행', detail: '설정 변경 후 돌핀POS를 종료하고 다시 실행해주세요. 화면이 정상적으로 표시됩니다.', image: null },
          ],
          note: '배율을 100%로 변경하면 글씨가 작아질 수 있지만, POS 화면이 정상적으로 표시됩니다.'
        }
      ]
    }
  ],
  notice: '문제 해결이 어려우시면 경영지원팀에 문의해주세요.',
  lastUpdate: '2026-03-24'
}
