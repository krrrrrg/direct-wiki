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
        },
        {
          id: 'scanner-barcode',
          title: '바코드가 숫자로 나올 때 (스캐너 설정)',
          symptom: '바코드 스캐너 최초 설정 또는 바코드가 숫자로 인식되는 경우',
          keywords: ['바코드', '스캐너', '숫자', 'QR', '스캐너 설정', '최초설정', '바코드리더기'],
          shortcut: null,
          steps: [
            { action: '돌핀POS 로그인', detail: '돌핀POS에 로그인해주세요.', image: null },
            { action: '하단 설정 메뉴 진입', detail: '화면 하단의 "설정" 버튼을 눌러주세요.', image: '/images/단말기-결제오류/스캐너설정/step2.jpg' },
            { action: '스캐너 설정 바코드 QR 인식', detail: '오른쪽 "일반 설정" 영역에 있는 스캐너 설정 바코드(QR코드)를 바코드 리더기로 "삑" 소리가 날 때까지 인식시켜주세요.', image: '/images/단말기-결제오류/스캐너설정/step3.jpg' },
          ],
          note: '최초 설정 시 또는 바코드가 숫자로 나올 때 이 과정을 진행해주세요. 삑 소리가 나면 설정 완료입니다.'
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
    }
  ],
  notice: '문제 해결이 어려우시면 경영지원팀에 문의해주세요.',
  lastUpdate: '2026-03-06'
}
