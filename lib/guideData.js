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
      title: '마감 / 재오픈',
      icon: '\u{1F504}',
      desc: '시재마감 후 재오픈, 결제 처리',
      color: '#00c473',
      gradient: 'linear-gradient(135deg, #00c473, #5de7a0)',
      guides: [
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
            { action: '바코드 스캐너 설정', detail: '돌핀POS를 처음 실행하면 바코드 스캐너 설정 화면이 나타납니다. STEP 1의 설정 바코드와 STEP 2의 확인 바코드를 순서대로 바코드 리더기로 스캔해주세요. 완료 후 건너뛰기를 눌러주세요.', image: '/images/로그인-바코드/최초로그인/step1.jpg' },
            { action: '매장 인증', detail: '매장 아이디와 비밀번호를 입력한 뒤 "매장 인증" 버튼을 눌러주세요. 자동로그인에 체크하면 다음부터 자동으로 로그인됩니다.', image: '/images/로그인-바코드/최초로그인/step2.jpg' },
            { action: '직원 로그인', detail: '매장 인증이 완료되면 직원 로그인 화면이 나타납니다. 직원 아이디와 비밀번호를 입력하고 "POS 로그인" 버튼을 눌러주세요.', image: '/images/로그인-바코드/최초로그인/step3.jpg' },
          ],
          note: '매장 아이디/비밀번호를 모르시면 경영지원팀에 문의해주세요.\n\n최초 로그인하신 매장은 자동으로 매장 로그인이 되어있어 직원 아이디만 로그인하시면 됩니다.'
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
  lastUpdate: '2026-03-09'
}
