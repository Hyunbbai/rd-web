/* 인증·확인 상태는 이 탭의 메모리에서만 관리한다. 토큰과 서버 응답은 기록하지 않는다. */
(() => {
  "use strict";
  // 유효한 문서 복귀 언어만 받으며, 그 외 새 페이지는 영어로 시작한다. 선택은 탭 메모리에만 둔다.
  const MESSAGES = {
    en: {
      skipLink: "Skip to content",
      languageLabel: "Language",
      brandLink: "Back to {game}",
      backToGame: "Back to game",
      pageTitle: "Delete account",
      metaDescription:
        "Delete your {game} game account and progress saved on the server.",
      intro:
        "Permanently delete your game account and progress saved on the server.",
      scopeTitle: "Before you delete",
      scopeCopy:
        "This applies to your {game} account. You do not need to install or open the game.",
      deletedTitle: "Deleted",
      deletedCopy:
        "Your game sign-in account and server-saved profile, currency, upgrades, collection, kill history and best records.",
      keptTitle: "Not deleted",
      keptCopy:
        "Your Google account, Google Play Games account, guest records, other game accounts and device settings.",
      retainedTitle: "Minimal record retained",
      retainedCopy:
        "Minimum UID-linked information needed to complete deletion and prevent recreation of data associated with the former account is retained for no more than 30 days after account deletion. It is disposed of without delay if that purpose is met sooner.",
      deviceTitle: "Saved data on your devices",
      deviceCopy:
        "Close the game on other devices and browser tabs first. This page cannot remove local game files. The game blocks syncing for an account once it confirms that the account was deleted, but local records may remain.",
      deviceCleanup:
        "You can clear app or browser storage separately to remove local records. This may also erase guest records and other accounts’ local data.",
      processTitle: "How deletion works",
      processSignIn: "Sign in with the Google account you use in the game.",
      processConfirm:
        "Confirm deletion, then verify the same Google account again.",
      processServer:
        "We replace server progress with a deletion marker and read it back to confirm.",
      processAuth: "We then delete the game’s Firebase sign-in account.",
      processRetry:
        "Deleted progress cannot be restored. If the last step fails, you can retry the remaining steps with the same account.",
      actionSignIn: "Sign in to continue",
      actionConfirm: "Confirm account deletion",
      actionComplete: "Account deleted",
      descriptionSignIn: "Use the Google account you use in the game.",
      descriptionConfirm: "Check that this is the account you use in the game.",
      descriptionComplete:
        "Your Google and Google Play Games accounts are unchanged.",
      signInButton: "Continue with Google",
      retryConnection: "Retry connection",
      sessionNote:
        "Sign-in lasts only in this tab. Sign-in details and tokens are not saved to browser storage.",
      accountLabel: "Account to delete",
      accountIdLabel: "Account ID",
      fallbackName: "Google account",
      fallbackEmail: "Email not provided",
      irreversibleTitle: "Deleted progress cannot be restored.",
      irreversibleCopy:
        "Server progress is removed before the game sign-in account. Keep this tab open and do not refresh while deletion is in progress.",
      consentLabel:
        "I have read the information above and agree to delete this game account and its server-saved progress.",
      confirmationLabel: "Type DELETE to confirm",
      confirmationHelp:
        "You will verify the same Google account again before deletion starts.",
      deleteButton: "Verify and delete account",
      deleteRetryButton: "Verify same account and retry",
      busyButton: "Processing…",
      signOutButton: "Cancel or choose another account",
      completeCopy:
        "We confirmed deletion of your server progress and game sign-in account. Only the minimal deletion record remains to prevent old progress from being uploaded again.",
      retryWarning:
        "Progress may already be deleted. Do not refresh or start a new sign-in. Use this page to check the remaining steps with the same account.",
      footer: "Account management",
      termsLink: "Terms of Service",
      privacyLink: "Privacy Policy",
      contactLabel: "Contact",
      preparingSignIn: "Preparing sign-in…",
      clearingSignIn: "Clearing sign-in details from this tab…",
      connectionUnavailable:
        "Sign-in could not be prepared. Check your connection or the site’s sign-in settings, then retry.",
      chooseAccount:
        "Choose the Google account you use in the game in the sign-in window.",
      accountConfirmed: "Account confirmed. Review the deletion details below.",
      reauthRequested:
        "Verify the same Google account again. Deletion starts after verification.",
      deletingProgress:
        "Deleting server progress and checking the deletion marker…",
      deletingAuth:
        "Server progress deletion confirmed. Deleting the game sign-in account…",
      authSlow:
        "Still waiting for the game account deletion response. Completion is not yet confirmed. Keep this tab open.",
      completeStatus: "Account deletion completed.",
      progressDeleted: "Server progress has been deleted.",
      progressUnconfirmed: "Server progress deletion has not been confirmed.",
      authUnconfirmed: "Game sign-in account deletion has not been confirmed.",
      partialCancelled:
        "Verification was cancelled. Confirm your consent again to retry the remaining steps.",
      partialSignedOut:
        "Authentication was lost, so completion cannot be confirmed. Avoid starting a new sign-in, which may create a new account. If verifying the same account keeps failing, ask the operator to check its status.",
      navigationBlocked:
        "Deletion or result verification is still in progress. Check the current step in this tab first.",
      errorCancelled:
        "Google verification was cancelled. No new deletion was started.",
      errorMismatch:
        "That account does not match the deletion target. Choose the same Google account shown on this page.",
      errorConfiguration:
        "Google sign-in is unavailable. Check pop-up permissions, your connection and the site’s sign-in settings.",
      errorRecentLogin:
        "Verification has expired. Verify the same Google account again.",
      errorSignedOut:
        "Your current authentication state could not be confirmed.",
      errorNetwork: "Check your network connection and retry.",
      errorBusy:
        "Wait for the previous authentication request to finish, then retry.",
      errorPermission:
        "The server did not allow deletion. If this continues after verifying the same account again, the site’s deletion rules need to be checked.",
      errorConflict:
        "Another device was saving at the same time. Close the game everywhere, then retry.",
      errorCapacity:
        "The server response or request limit was exceeded. Try again later.",
      errorData:
        "The server response could not be safely verified. Deletion has not been marked complete.",
      errorAuth:
        "Authentication could not be verified. Verify the same Google account again.",
      errorUnknown: "Authentication could not be completed. Try again later.",
    },
    ko: {
      skipLink: "본문으로 이동",
      languageLabel: "언어",
      brandLink: "{game} 게임으로 돌아가기",
      backToGame: "게임으로 돌아가기",
      pageTitle: "계정 삭제",
      metaDescription: "{game}의 게임 계정과 서버 진행 기록을 삭제합니다.",
      intro: "게임 계정과 서버에 저장된 진행 기록을 영구 삭제합니다.",
      scopeTitle: "삭제 전 확인",
      scopeCopy:
        "{game} 계정에 적용됩니다. 게임을 설치하거나 실행하지 않아도 이용할 수 있습니다.",
      deletedTitle: "삭제되는 정보",
      deletedCopy:
        "게임 로그인 계정과 서버에 저장된 프로필, 재화·강화, 도감·처치 이력·최고 기록",
      keptTitle: "유지되는 정보",
      keptCopy:
        "Google 계정, Google Play Games 계정 자체, 게스트 기록, 다른 게임 계정 및 기기 설정",
      retainedTitle: "최소 기록 보관",
      retainedCopy:
        "삭제 처리 완료와 이전 계정에 연결된 데이터의 재생성 방지에 필요한 최소 UID 연계 정보는 계정 삭제 후 최대 30일까지만 보유합니다. 목적이 먼저 달성되면 지체 없이 파기합니다.",
      deviceTitle: "기기에 남는 저장 데이터",
      deviceCopy:
        "먼저 다른 기기와 브라우저 탭에서 게임을 닫아 주세요. 이 페이지는 로컬 게임 파일을 지우지 않습니다. 게임이 삭제 상태를 확인하면 해당 계정의 동기화를 차단하지만, 로컬 기록은 계속 남을 수 있습니다.",
      deviceCleanup:
        "로컬 기록은 앱 또는 브라우저의 저장 공간을 별도로 정리해 제거할 수 있습니다. 이 경우 게스트와 다른 계정의 로컬 기록도 함께 지워질 수 있습니다.",
      processTitle: "삭제 진행 순서",
      processSignIn: "게임에서 사용한 Google 계정으로 로그인합니다.",
      processConfirm: "삭제에 동의한 뒤 같은 Google 계정으로 재인증합니다.",
      processServer: "서버 진행을 삭제 표식으로 바꾸고 다시 조회해 확인합니다.",
      processAuth: "그다음 게임의 Firebase 로그인 계정을 삭제합니다.",
      processRetry:
        "삭제된 진행은 복구할 수 없습니다. 마지막 단계가 실패하면 같은 계정으로 남은 단계를 재시도할 수 있습니다.",
      actionSignIn: "로그인 후 계속하기",
      actionConfirm: "계정 삭제 확인",
      actionComplete: "계정 삭제 완료",
      descriptionSignIn: "게임에서 사용한 Google 계정으로 로그인해 주세요.",
      descriptionConfirm:
        "표시된 계정이 게임에서 사용한 계정인지 확인해 주세요.",
      descriptionComplete:
        "Google 계정과 Google Play Games 계정 자체는 유지됩니다.",
      signInButton: "Google로 계속하기",
      retryConnection: "연결 재시도",
      sessionNote:
        "로그인은 이 탭에서만 유지됩니다. 로그인 정보와 토큰은 브라우저 저장소에 보관하지 않습니다.",
      accountLabel: "삭제 대상 계정",
      accountIdLabel: "계정 식별자",
      fallbackName: "Google 계정",
      fallbackEmail: "이메일이 제공되지 않은 계정",
      irreversibleTitle: "삭제한 진행은 복구할 수 없습니다.",
      irreversibleCopy:
        "서버 기록을 삭제한 뒤 게임 로그인 계정을 삭제합니다. 처리 중에는 이 탭을 닫거나 새로고침하지 마세요.",
      consentLabel:
        "위 내용을 읽었으며, 이 게임 계정과 서버 진행 기록의 삭제에 동의합니다.",
      confirmationLabel: "확인을 위해 DELETE를 입력해 주세요",
      confirmationHelp:
        "삭제를 시작하기 전에 같은 Google 계정으로 다시 인증합니다.",
      deleteButton: "재인증 후 계정 삭제",
      deleteRetryButton: "같은 계정 재인증 후 재시도",
      busyButton: "처리 중…",
      signOutButton: "취소 또는 다른 계정 선택",
      completeCopy:
        "서버 진행 기록과 게임 로그인 계정의 삭제를 확인했습니다. 오래된 기록의 재전송을 막는 최소 삭제 기록만 남습니다.",
      retryWarning:
        "진행 기록은 이미 삭제되었을 수 있습니다. 새로고침하거나 새로 로그인하지 말고, 이 화면에서 같은 계정으로 남은 단계를 확인해 주세요.",
      footer: "계정 관리",
      termsLink: "이용약관",
      privacyLink: "개인정보 처리방침",
      contactLabel: "문의",
      preparingSignIn: "로그인 연결을 준비하고 있습니다.",
      clearingSignIn: "이 탭의 로그인 정보를 정리하고 있습니다.",
      connectionUnavailable:
        "로그인 연결을 준비하지 못했습니다. 네트워크나 사이트의 로그인 설정을 확인한 뒤 다시 시도해 주세요.",
      chooseAccount: "Google 로그인 창에서 게임에 사용한 계정을 선택해 주세요.",
      accountConfirmed: "계정을 확인했습니다. 아래 삭제 내용을 확인해 주세요.",
      reauthRequested:
        "같은 Google 계정으로 다시 인증해 주세요. 인증 후 삭제가 시작됩니다.",
      deletingProgress: "서버 진행을 삭제하고 삭제 표식을 확인하고 있습니다.",
      deletingAuth:
        "서버 진행 삭제를 확인했습니다. 게임 로그인 계정을 삭제하고 있습니다.",
      authSlow:
        "게임 계정의 삭제 응답을 기다리고 있습니다. 완료 여부는 아직 확인되지 않았습니다. 이 탭을 유지해 주세요.",
      completeStatus: "계정 삭제가 완료되었습니다.",
      progressDeleted: "서버 진행 기록은 삭제되었습니다.",
      progressUnconfirmed: "서버 진행의 삭제 여부를 아직 확인하지 못했습니다.",
      authUnconfirmed: "게임 로그인 계정의 삭제 완료는 확인되지 않았습니다.",
      partialCancelled:
        "재인증을 취소했습니다. 남은 단계를 마치려면 다시 동의하고 재시도해 주세요.",
      partialSignedOut:
        "인증이 끊겨 완료를 확정할 수 없습니다. 새 로그인은 새 계정을 만들 수 있으므로 피해주세요. 같은 계정 재인증도 계속 실패하면 운영자에게 계정 상태 확인을 요청해 주세요.",
      navigationBlocked:
        "삭제 처리 또는 결과 확인이 진행 중입니다. 이 탭에서 현재 단계를 먼저 확인해 주세요.",
      errorCancelled:
        "Google 인증을 취소했습니다. 삭제는 새로 시작되지 않았습니다.",
      errorMismatch:
        "선택한 계정이 삭제 대상과 다릅니다. 표시된 계정과 같은 Google 계정을 선택해 주세요.",
      errorConfiguration:
        "Google 로그인을 사용할 수 없습니다. 팝업 허용, 네트워크와 사이트의 로그인 설정을 확인해 주세요.",
      errorRecentLogin:
        "인증 유효 시간이 지났습니다. 같은 Google 계정으로 다시 인증해 주세요.",
      errorSignedOut: "현재 인증 상태를 확인할 수 없습니다.",
      errorNetwork: "네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
      errorBusy: "이전 인증 요청이 끝난 뒤 다시 시도해 주세요.",
      errorPermission:
        "서버가 삭제 요청을 허용하지 않았습니다. 같은 계정으로 다시 인증해도 계속되면 사이트의 삭제 규칙 설정 확인이 필요합니다.",
      errorConflict:
        "다른 기기의 저장과 요청이 겹쳤습니다. 게임을 모두 닫은 뒤 다시 시도해 주세요.",
      errorCapacity:
        "서버 응답 크기나 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
      errorData:
        "서버 응답을 안전하게 확인하지 못했습니다. 삭제 완료로 처리하지 않았습니다.",
      errorAuth:
        "인증 정보를 확인하지 못했습니다. 같은 Google 계정으로 다시 인증해 주세요.",
      errorUnknown: "인증을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    },
    "zh-CN": {
      skipLink: "跳转到正文",
      languageLabel: "语言",
      brandLink: "返回 {game}",
      backToGame: "返回游戏",
      pageTitle: "删除账号",
      metaDescription: "删除您的 {game} 游戏账号及服务器上的游戏进度。",
      intro: "永久删除您的游戏账号及服务器上保存的游戏进度。",
      scopeTitle: "删除前请确认",
      scopeCopy: "此操作适用于您的 {game} 账号。无需安装或打开游戏。",
      deletedTitle: "将被删除",
      deletedCopy:
        "游戏登录账号，以及服务器上保存的个人资料、货币、强化、图鉴、击杀历史和最佳记录。",
      keptTitle: "不会删除",
      keptCopy:
        "Google 账号、Google Play Games 账号本身、游客记录、其他游戏账号及设备设置。",
      retainedTitle: "保留的最少记录",
      retainedCopy:
        "为完成删除及防止与原账号关联的数据被重新创建，所需的最少 UID 关联信息在账号删除后最多保留30天。如更早实现该目的，将及时删除。",
      deviceTitle: "设备上的存档",
      deviceCopy:
        "请先关闭其他设备和浏览器标签页中的游戏。此页面无法删除本地游戏文件。游戏确认账号已删除后，会阻止该账号同步，但本地记录仍可能保留。",
      deviceCleanup:
        "您可以另行清除应用或浏览器存储来移除本地记录。这也可能删除游客记录和其他账号的本地数据。",
      processTitle: "删除流程",
      processSignIn: "使用您在游戏中使用的 Google 账号登录。",
      processConfirm: "确认删除后，再次验证同一个 Google 账号。",
      processServer: "将服务器上的进度替换为删除标记，并重新读取以确认。",
      processAuth: "然后删除游戏的 Firebase 登录账号。",
      processRetry:
        "已删除的进度无法恢复。如果最后一步失败，您可以使用同一账号重试剩余步骤。",
      actionSignIn: "登录以继续",
      actionConfirm: "确认删除账号",
      actionComplete: "账号已删除",
      descriptionSignIn: "请使用您在游戏中使用的 Google 账号。",
      descriptionConfirm: "请确认显示的账号是您在游戏中使用的账号。",
      descriptionComplete:
        "您的 Google 和 Google Play Games 账号本身未受影响。",
      signInButton: "使用 Google 继续",
      retryConnection: "重试连接",
      sessionNote:
        "登录仅在此标签页中有效。登录信息和令牌不会保存到浏览器存储中。",
      accountLabel: "要删除的账号",
      accountIdLabel: "账号 ID",
      fallbackName: "Google 账号",
      fallbackEmail: "未提供电子邮箱",
      irreversibleTitle: "已删除的进度无法恢复。",
      irreversibleCopy:
        "先删除服务器上的进度，再删除游戏登录账号。删除过程中，请勿关闭或刷新此标签页。",
      consentLabel:
        "我已阅读以上信息，并同意删除此游戏账号及其服务器上的进度。",
      confirmationLabel: "请输入 DELETE 以确认",
      confirmationHelp: "删除开始前，需要再次验证同一个 Google 账号。",
      deleteButton: "验证并删除账号",
      deleteRetryButton: "验证同一账号并重试",
      busyButton: "正在处理…",
      signOutButton: "取消或选择其他账号",
      completeCopy:
        "已确认服务器上的进度和游戏登录账号均已删除。仅保留最少的删除记录，以防旧进度再次上传。",
      retryWarning:
        "进度可能已被删除。请勿刷新或重新发起登录。请在此页面使用同一账号检查剩余步骤。",
      footer: "账号管理",
      termsLink: "服务条款",
      privacyLink: "隐私政策",
      contactLabel: "联系",
      preparingSignIn: "正在准备登录…",
      clearingSignIn: "正在清除此标签页的登录信息…",
      connectionUnavailable:
        "无法准备登录。请检查网络连接或网站的登录设置，然后重试。",
      chooseAccount: "请在 Google 登录窗口中选择您在游戏中使用的账号。",
      accountConfirmed: "账号已确认。请查看下方的删除说明。",
      reauthRequested: "请再次验证同一个 Google 账号。验证完成后将开始删除。",
      deletingProgress: "正在删除服务器上的进度并检查删除标记…",
      deletingAuth: "已确认服务器上的进度已删除。正在删除游戏登录账号…",
      authSlow:
        "仍在等待游戏账号删除的响应，尚未确认完成。请保持此标签页打开。",
      completeStatus: "账号删除已完成。",
      progressDeleted: "服务器上的进度已删除。",
      progressUnconfirmed: "尚未确认服务器上的进度是否已删除。",
      authUnconfirmed: "尚未确认游戏登录账号已删除。",
      partialCancelled: "验证已取消。请重新同意删除，以重试剩余步骤。",
      partialSignedOut:
        "认证已失效，无法确认是否完成。请勿重新发起登录，否则可能创建新账号。如果验证同一账号持续失败，请联系运营方检查账号状态。",
      navigationBlocked:
        "删除或结果确认仍在进行中。请先在此标签页检查当前步骤。",
      errorCancelled: "Google 验证已取消。未开始新的删除操作。",
      errorMismatch:
        "该账号与删除目标不一致。请选择此页面显示的同一个 Google 账号。",
      errorConfiguration:
        "Google 登录不可用。请检查弹出窗口权限、网络连接和网站的登录设置。",
      errorRecentLogin: "验证已过期。请再次验证同一个 Google 账号。",
      errorSignedOut: "无法确认当前认证状态。",
      errorNetwork: "请检查网络连接后重试。",
      errorBusy: "请等待上一次认证请求结束后重试。",
      errorPermission:
        "服务器未允许删除。如果再次验证同一账号后仍出现此问题，需要检查网站的删除规则设置。",
      errorConflict: "另一台设备正在同时保存。请关闭所有设备上的游戏后重试。",
      errorCapacity: "已超过服务器响应大小或请求限制。请稍后重试。",
      errorData: "无法安全验证服务器响应。尚未将删除标记为完成。",
      errorAuth: "无法验证认证信息。请再次验证同一个 Google 账号。",
      errorUnknown: "无法完成认证。请稍后重试。",
    },
    ja: {
      skipLink: "本文へ移動",
      languageLabel: "言語",
      brandLink: "{game} に戻る",
      backToGame: "ゲームに戻る",
      pageTitle: "アカウント削除",
      metaDescription:
        "{game} のゲームアカウントとサーバーに保存された進行データを削除します。",
      intro:
        "ゲームアカウントとサーバーに保存された進行データを完全に削除します。",
      scopeTitle: "削除前にご確認ください",
      scopeCopy:
        "{game} のアカウントが対象です。ゲームをインストールしたり、起動したりする必要はありません。",
      deletedTitle: "削除されるもの",
      deletedCopy:
        "ゲームのログインアカウントと、サーバーに保存されたプロフィール、通貨、強化、図鑑、討伐履歴、最高記録。",
      keptTitle: "削除されないもの",
      keptCopy:
        "Google アカウント、Google Play Games アカウント自体、ゲストの記録、他のゲームアカウント、端末の設定。",
      retainedTitle: "保持される最小限の記録",
      retainedCopy:
        "削除処理の完了と、以前のアカウントに関連するデータの再作成防止に必要な最小限の UID 関連情報は、アカウント削除後、最大30日間のみ保存します。目的を先に達成した場合は遅滞なく消去します。",
      deviceTitle: "端末に保存されたデータ",
      deviceCopy:
        "先に、他の端末やブラウザーのタブでゲームを閉じてください。このページでは端末内のゲームファイルを削除できません。ゲームがアカウントの削除を確認すると同期を停止しますが、端末内の記録は残る場合があります。",
      deviceCleanup:
        "端末内の記録を消すには、アプリまたはブラウザーのストレージを別途消去できます。その場合、ゲストの記録や他のアカウントの端末内データも消える可能性があります。",
      processTitle: "削除の手順",
      processSignIn: "ゲームで使用している Google アカウントでログインします。",
      processConfirm: "削除に同意し、同じ Google アカウントで再認証します。",
      processServer:
        "サーバーの進行データを削除マーカーに置き換え、再取得して確認します。",
      processAuth: "その後、ゲームの Firebase ログインアカウントを削除します。",
      processRetry:
        "削除した進行データは復元できません。最後の手順に失敗した場合は、同じアカウントで残りの手順を再試行できます。",
      actionSignIn: "ログインして続ける",
      actionConfirm: "アカウント削除の確認",
      actionComplete: "アカウントを削除しました",
      descriptionSignIn:
        "ゲームで使用している Google アカウントでログインしてください。",
      descriptionConfirm:
        "表示されたアカウントがゲームで使用しているものか確認してください。",
      descriptionComplete:
        "Google アカウントと Google Play Games アカウント自体は変更されていません。",
      signInButton: "Google で続ける",
      retryConnection: "接続を再試行",
      sessionNote:
        "ログインはこのタブ内でのみ有効です。ログイン情報やトークンはブラウザーのストレージに保存されません。",
      accountLabel: "削除するアカウント",
      accountIdLabel: "アカウント ID",
      fallbackName: "Google アカウント",
      fallbackEmail: "メールアドレスは提供されていません",
      irreversibleTitle: "削除した進行データは復元できません。",
      irreversibleCopy:
        "サーバーの進行データを削除してから、ゲームのログインアカウントを削除します。処理中はこのタブを閉じたり、再読み込みしたりしないでください。",
      consentLabel:
        "上記の内容を読み、このゲームアカウントとサーバー上の進行データの削除に同意します。",
      confirmationLabel: "確認のため DELETE と入力してください",
      confirmationHelp:
        "削除を始める前に、同じ Google アカウントで再認証します。",
      deleteButton: "再認証してアカウントを削除",
      deleteRetryButton: "同じアカウントで再認証して再試行",
      busyButton: "処理中…",
      signOutButton: "キャンセル・別のアカウントを選択",
      completeCopy:
        "サーバーの進行データとゲームのログインアカウントの削除を確認しました。古い進行データの再送信を防ぐため、最小限の削除記録のみ残ります。",
      retryWarning:
        "進行データはすでに削除されている可能性があります。再読み込みや新たなログインは行わず、このページで同じアカウントを使って残りの手順を確認してください。",
      footer: "アカウント管理",
      termsLink: "利用規約",
      privacyLink: "プライバシーポリシー",
      contactLabel: "お問い合わせ",
      preparingSignIn: "ログインを準備しています。",
      clearingSignIn: "このタブのログイン情報を消去しています。",
      connectionUnavailable:
        "ログインを準備できませんでした。ネットワーク接続やサイトのログイン設定を確認し、再試行してください。",
      chooseAccount:
        "Google のログイン画面で、ゲームに使用しているアカウントを選択してください。",
      accountConfirmed:
        "アカウントを確認しました。下の削除内容をご確認ください。",
      reauthRequested:
        "同じ Google アカウントで再認証してください。認証後に削除が始まります。",
      deletingProgress:
        "サーバーの進行データを削除し、削除マーカーを確認しています。",
      deletingAuth:
        "サーバーの進行データの削除を確認しました。ゲームのログインアカウントを削除しています。",
      authSlow:
        "ゲームアカウントの削除結果を待っています。完了はまだ確認できていません。このタブを開いたままにしてください。",
      completeStatus: "アカウントの削除が完了しました。",
      progressDeleted: "サーバーの進行データは削除されました。",
      progressUnconfirmed:
        "サーバーの進行データが削除されたかは、まだ確認できていません。",
      authUnconfirmed: "ゲームのログインアカウントの削除は確認できていません。",
      partialCancelled:
        "再認証をキャンセルしました。残りの手順を再試行するには、もう一度削除に同意してください。",
      partialSignedOut:
        "認証が失われたため、完了を確認できません。新たにログインすると新しいアカウントが作られる可能性があるため、避けてください。同じアカウントでの再認証に繰り返し失敗する場合は、運営者に状態の確認を依頼してください。",
      navigationBlocked:
        "削除処理または結果の確認が続いています。まず、このタブで現在の手順を確認してください。",
      errorCancelled:
        "Google の認証をキャンセルしました。新たな削除処理は始まっていません。",
      errorMismatch:
        "選択したアカウントが削除対象と一致しません。表示されているものと同じ Google アカウントを選んでください。",
      errorConfiguration:
        "Google ログインを利用できません。ポップアップの許可、ネットワーク接続、サイトのログイン設定を確認してください。",
      errorRecentLogin:
        "認証の有効期限が切れました。同じ Google アカウントで再認証してください。",
      errorSignedOut: "現在の認証状態を確認できません。",
      errorNetwork: "ネットワーク接続を確認し、再試行してください。",
      errorBusy: "前の認証リクエストが終わってから再試行してください。",
      errorPermission:
        "サーバーが削除を許可しませんでした。同じアカウントで再認証しても続く場合は、サイトの削除ルール設定の確認が必要です。",
      errorConflict:
        "別の端末の保存処理と重なりました。すべての端末でゲームを閉じてから再試行してください。",
      errorCapacity:
        "サーバーの応答サイズまたはリクエスト数が上限を超えました。しばらくしてから再試行してください。",
      errorData:
        "サーバーの応答を安全に確認できませんでした。削除完了として処理していません。",
      errorAuth:
        "認証情報を確認できませんでした。同じ Google アカウントで再認証してください。",
      errorUnknown:
        "認証を完了できませんでした。しばらくしてから再試行してください。",
    },
  };
  const PROJECT_ID = "com-hyunbbai-frd";
  const API_ROOT = "https://firestore.googleapis.com/v1/";
  const RESPONSE_LIMIT = 1048576;
  const PROFILE_LIMIT = 400000;
  const REQUEST_TIMEOUT = 15000;
  const UID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
  const TIMESTAMP_PATTERN =
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,9})?Z$/;
  const byId = (id) => document.getElementById(id);
  const ui = Object.fromEntries(
    [
      "language",
      "account-card",
      "action-title",
      "card-description",
      "status-box",
      "status",
      "signed-out-panel",
      "sign-in",
      "retry-connection",
      "signed-in-panel",
      "account-name",
      "account-email",
      "account-uid",
      "delete-form",
      "consent",
      "confirmation",
      "delete-account",
      "sign-out",
      "completed-panel",
      "retry-warning",
    ].map((id) => [id, byId(id)]),
  );
  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  const queryLanguages = { en: "en", ko: "ko", zh_CN: "zh-CN", ja: "ja" };
  let language = Object.hasOwn(queryLanguages, requestedLanguage)
    ? queryLanguages[requestedLanguage] : "en";
  let statusKeys = ["preparingSignIn"];
  const gameName = document.body.dataset.gameName;
  let identity = null;
  let busy = false;
  let available = false;
  let complete = false;
  let irreversible = false;
  let tombstoneConfirmed = false;
  let authAttempted = false;
  let requestSequence = 0;
  let connectionEpoch = 0;
  const bridge = () => globalThis.FirebaseAuth;
  const failure = (code) => Object.assign(new Error(code), { code });
  const isObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  const exactKeys = (value, keys) =>
    isObject(value) &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key));
  const typed = (fields, key, type) => exactKeys(fields[key], [type]);
  const timestamp = (value) =>
    typeof value === "string" && TIMESTAMP_PATTERN.test(value);
  const delay = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  function translate(key) {
    return (MESSAGES[language][key] || MESSAGES.en[key]).replaceAll(
      "{game}",
      () => gameName,
    );
  }

  function setStatus(keys, tone = "info") {
    statusKeys = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
    ui.status.textContent = statusKeys.map(translate).join(" ");
    ui["status-box"].dataset.tone = tone;
  }

  function renderLanguage() {
    document.documentElement.lang = language;
    document.title = `${translate("pageTitle")} · ${gameName}`;
    document.querySelector('meta[name="description"]').content =
      translate("metaDescription");
    ui.language.value = language;
    for (const element of document.querySelectorAll("[data-i18n]")) {
      element.textContent = translate(element.dataset.i18n);
    }
    for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
      element.setAttribute(
        "aria-label",
        translate(element.dataset.i18nAriaLabel),
      );
    }
    const documentLanguage = language === "zh-CN" ? "zh_CN" : language;
    for (const link of document.querySelectorAll(".legal-link")) {
      const kind = link.dataset.document;
      if (kind === "terms" || kind === "privacy") {
        link.href = `../${kind}/?lang=${encodeURIComponent(documentLanguage)}`;
      }
    }
    // 문구만 갱신한다. UID·동의·입력·삭제 상태는 언어 변경으로 바꾸지 않는다.
    ui.status.textContent = statusKeys.map(translate).join(" ");
    render();
  }

  function render() {
    ui["account-card"].setAttribute("aria-busy", String(busy));
    ui.language.disabled = busy;
    ui["signed-out-panel"].hidden = Boolean(identity) || complete;
    ui["signed-in-panel"].hidden = !identity || complete;
    ui["completed-panel"].hidden = !complete;
    ui["sign-in"].disabled = busy || !available || complete;
    ui["retry-connection"].hidden =
      available || busy || Boolean(identity) || complete;
    ui.consent.disabled = busy;
    ui.confirmation.disabled = busy;
    ui["delete-account"].disabled =
      busy ||
      !identity ||
      complete ||
      !ui.consent.checked ||
      ui.confirmation.value.trim() !== "DELETE";
    ui["sign-out"].hidden = irreversible;
    ui["sign-out"].disabled = busy;
    ui["retry-warning"].hidden = !irreversible || complete;
    ui["delete-account"].textContent = translate(
      busy ? "busyButton" : irreversible ? "deleteRetryButton" : "deleteButton",
    );
    ui["action-title"].textContent = translate(
      complete ? "actionComplete" : identity ? "actionConfirm" : "actionSignIn",
    );
    ui["card-description"].textContent = translate(
      complete
        ? "descriptionComplete"
        : identity
          ? "descriptionConfirm"
          : "descriptionSignIn",
    );
    if (identity) {
      ui["account-name"].textContent =
        identity.displayName || translate("fallbackName");
      ui["account-email"].textContent =
        identity.email || translate("fallbackEmail");
      ui["account-uid"].textContent = identity.uid;
    }
  }

  function resetConsent() {
    ui.consent.checked = false;
    ui.confirmation.value = "";
  }

  function validateIdentity(value, expectedUid = "") {
    if (!isObject(value) || value.project_id !== PROJECT_ID)
      throw failure("not_configured");
    if (
      typeof value.uid !== "string" ||
      !UID_PATTERN.test(value.uid) ||
      (expectedUid && value.uid !== expectedUid)
    )
      throw failure("user_mismatch");
    if (
      typeof value.id_token !== "string" ||
      !/^[\x21-\x7e]+$/.test(value.id_token)
    )
      throw failure("auth");
    return value;
  }

  function invoke(method, expectedUid = "") {
    // Promise의 실행 함수에서 브리지를 바로 호출해 실제 클릭의 popup 권한을 유지한다.
    return new Promise((resolve, reject) => {
      const auth = bridge();
      if (!auth || typeof auth[method] !== "function") {
        reject(failure("not_configured"));
        return;
      }
      const requestId = ++requestSequence;
      const callback = (raw) => {
        let value;
        try {
          value = JSON.parse(raw);
        } catch (_) {
          reject(failure("invalid_data"));
          return;
        }
        if (!isObject(value) || value.request_id !== requestId) {
          reject(failure("invalid_data"));
          return;
        }
        if (value.ok !== true) {
          reject(
            failure(
              typeof value.error === "string" ? value.error : "auth_failed",
            ),
          );
          return;
        }
        resolve(value);
      };
      try {
        if (expectedUid) auth[method](requestId, expectedUid, callback);
        else auth[method](requestId, callback);
      } catch (_) {
        reject(failure("auth_failed"));
      }
    });
  }

  async function waitForConnection(signingOut = false) {
    const epoch = ++connectionEpoch;
    busy = true;
    available = false;
    setStatus(signingOut ? "clearingSignIn" : "preparingSignIn");
    render();
    for (let attempt = 0; attempt < 80; attempt++) {
      if (epoch !== connectionEpoch) return;
      if (bridge()?.isAvailable()) {
        available = true;
        busy = false;
        setStatus("descriptionSignIn");
        render();
        return;
      }
      await delay(250);
    }
    if (epoch !== connectionEpoch) return;
    busy = false;
    setStatus("connectionUnavailable", "error");
    render();
  }

  function authMessageKey(code) {
    const messages = {
      cancelled: "errorCancelled",
      user_mismatch: "errorMismatch",
      not_configured: "errorConfiguration",
      recent_login_required: "errorRecentLogin",
      signed_out: "errorSignedOut",
      network: "errorNetwork",
      busy: "errorBusy",
      permission: "errorPermission",
      conflict: "errorConflict",
      capacity: "errorCapacity",
      invalid_data: "errorData",
      auth: "errorAuth",
    };
    return messages[code] || "errorUnknown";
  }

  function httpError(status, data) {
    const code = isObject(data.error) ? data.error.status : "";
    if (status === 401 || code === "UNAUTHENTICATED") return "auth";
    if (status === 403 || code === "PERMISSION_DENIED") return "permission";
    if (
      status === 409 ||
      ["ABORTED", "ALREADY_EXISTS", "FAILED_PRECONDITION"].includes(code)
    )
      return "conflict";
    if ([413, 429].includes(status) || code === "RESOURCE_EXHAUSTED")
      return "capacity";
    if (status === 404) return "not_configured";
    if (status === 400 || code === "INVALID_ARGUMENT") return "invalid_data";
    return "network";
  }

  async function requestJson(url, token, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(url, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });
      // 응답 스트림에 크기 상한을 적용하고 프로필·토큰은 로그에 남기지 않는다.
      const reader = response.body?.getReader();
      if (!reader) throw failure("invalid_data");
      const decoder = new TextDecoder("utf-8", { fatal: true });
      let bytes = 0;
      let text = "";
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > RESPONSE_LIMIT) {
            await reader.cancel();
            throw failure("capacity");
          }
          text += decoder.decode(chunk.value, { stream: true });
        }
        text += decoder.decode();
      } finally {
        reader.releaseLock();
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (_) {
        throw failure("invalid_data");
      }
      if (!isObject(data)) throw failure("invalid_data");
      return { status: response.status, data };
    } catch (error) {
      if (["capacity", "invalid_data"].includes(error.code)) throw error;
      throw failure("network");
    } finally {
      clearTimeout(timeout);
    }
  }

  function decodeDocument(data, name) {
    if (
      data.name !== name ||
      !isObject(data.fields) ||
      !timestamp(data.updateTime)
    )
      throw failure("invalid_data");
    const fields = data.fields;
    if (
      !typed(fields, "schemaVersion", "integerValue") ||
      fields.schemaVersion.integerValue !== "1"
    )
      throw failure("invalid_data");
    if (Object.hasOwn(fields, "deleted")) {
      if (
        !exactKeys(fields, ["schemaVersion", "deleted", "deletedAt"]) ||
        !typed(fields, "deleted", "booleanValue") ||
        fields.deleted.booleanValue !== true ||
        !typed(fields, "deletedAt", "timestampValue") ||
        !timestamp(fields.deletedAt.timestampValue)
      )
        throw failure("invalid_data");
      return { exists: true, deleted: true };
    }
    if (
      !exactKeys(fields, [
        "schemaVersion",
        "revision",
        "profileJson",
        "updatedAt",
      ]) ||
      !typed(fields, "revision", "integerValue") ||
      typeof fields.revision.integerValue !== "string" ||
      !/^[1-9][0-9]{0,18}$/.test(fields.revision.integerValue) ||
      BigInt(fields.revision.integerValue) > 9223372036854775807n ||
      !typed(fields, "profileJson", "stringValue") ||
      typeof fields.profileJson.stringValue !== "string" ||
      !typed(fields, "updatedAt", "timestampValue") ||
      !timestamp(fields.updatedAt.timestampValue)
    )
      throw failure("invalid_data");
    if (
      new TextEncoder().encode(fields.profileJson.stringValue).length >
      PROFILE_LIMIT
    )
      throw failure("capacity");
    try {
      if (!isObject(JSON.parse(fields.profileJson.stringValue)))
        throw failure("invalid_data");
    } catch (_) {
      throw failure("invalid_data");
    }
    return { exists: true, deleted: false, updateTime: data.updateTime };
  }

  async function loadDocument(name, token) {
    const response = await requestJson(API_ROOT + name, token);
    if (response.status === 404) return { exists: false, deleted: false };
    if (response.status !== 200)
      throw failure(httpError(response.status, response.data));
    return decodeDocument(response.data, name);
  }

  async function deleteProgression(uid, token) {
    const name = `projects/${PROJECT_ID}/databases/(default)/documents/players/${encodeURIComponent(uid)}/saves/progression`;
    const endpoint = `${API_ROOT}projects/${PROJECT_ID}/databases/(default)/documents:commit`;
    for (let attempt = 0; attempt < 3; attempt++) {
      const previous = await loadDocument(name, token);
      if (previous.deleted) {
        irreversible = true;
        tombstoneConfirmed = true;
        return;
      }
      const write = {
        update: {
          name,
          fields: {
            schemaVersion: { integerValue: "1" },
            deleted: { booleanValue: true },
          },
        },
        currentDocument: previous.exists
          ? { updateTime: previous.updateTime }
          : { exists: false },
        updateTransforms: [
          { fieldPath: "deletedAt", setToServerValue: "REQUEST_TIME" },
        ],
      };
      // 전송이 시작되면 응답 유실이어도 취소/계정 전환으로 되돌릴 수 없다.
      irreversible = true;
      render();
      let commitError = null;
      try {
        const response = await requestJson(endpoint, token, {
          writes: [write],
        });
        if (response.status !== 200)
          commitError = failure(httpError(response.status, response.data));
      } catch (error) {
        commitError = error;
      }
      // commit 응답만 믿지 않고 동일 UID의 최소 표식을 GET으로 확인한다.
      let confirmed;
      try {
        confirmed = await loadDocument(name, token);
      } catch (error) {
        throw commitError || error;
      }
      if (confirmed.deleted) {
        tombstoneConfirmed = true;
        return;
      }
      if (commitError?.code === "conflict") continue;
      throw commitError || failure("invalid_data");
    }
    throw failure("conflict");
  }

  async function signIn() {
    if (busy || !available || identity || complete || irreversible) return;
    busy = true;
    setStatus("chooseAccount");
    render();
    try {
      const result = validateIdentity(await invoke("googleSignIn"));
      identity = {
        uid: result.uid,
        email: typeof result.email === "string" ? result.email : "",
        displayName:
          typeof result.display_name === "string" ? result.display_name : "",
      };
      result.id_token = "";
      resetConsent();
      setStatus("accountConfirmed");
    } catch (error) {
      setStatus(authMessageKey(error.code), "error");
    } finally {
      busy = false;
      render();
      if (identity) ui.consent.focus();
    }
  }

  async function deleteAccount(event) {
    event.preventDefault();
    if (
      busy ||
      !identity ||
      complete ||
      !ui.consent.checked ||
      ui.confirmation.value.trim() !== "DELETE"
    )
      return;
    const expectedUid = identity.uid;
    busy = true;
    setStatus("reauthRequested");
    render();
    let credentials = null;
    let slowTimer = null;
    try {
      credentials = validateIdentity(
        await invoke("reauthenticate", expectedUid),
        expectedUid,
      );
      if (identity?.uid !== expectedUid) throw failure("user_mismatch");
      setStatus("deletingProgress");
      await deleteProgression(expectedUid, credentials.id_token);
      credentials.id_token = "";
      if (!tombstoneConfirmed || identity?.uid !== expectedUid)
        throw failure("invalid_data");
      setStatus("deletingAuth");
      authAttempted = true;
      // 응답이 늦어도 잠금을 풀거나 같은 삭제를 중복 전송하지 않는다.
      slowTimer = setTimeout(() => setStatus("authSlow"), 20000);
      const result = await invoke("deleteAccount", expectedUid);
      if (
        result.uid !== expectedUid ||
        result.project_id !== PROJECT_ID ||
        result.deleted !== true
      )
        throw failure("invalid_data");
      complete = true;
      identity = null;
      resetConsent();
      ui["account-name"].textContent = "";
      ui["account-email"].textContent = "";
      ui["account-uid"].textContent = "";
      setStatus("completeStatus");
    } catch (error) {
      resetConsent();
      if (irreversible) {
        const prefix = tombstoneConfirmed
          ? "progressDeleted"
          : "progressUnconfirmed";
        const detail =
          error.code === "cancelled"
            ? "partialCancelled"
            : error.code === "signed_out"
              ? "partialSignedOut"
              : authMessageKey(error.code);
        setStatus(
          [prefix, authAttempted ? "authUnconfirmed" : "", detail],
          "error",
        );
      } else {
        setStatus(authMessageKey(error.code), "error");
      }
    } finally {
      if (credentials) credentials.id_token = "";
      if (slowTimer) clearTimeout(slowTimer);
      busy = false;
      render();
      ui.status.tabIndex = -1;
      ui.status.focus();
    }
  }

  function signOut() {
    if (busy || !identity || irreversible || complete) return;
    bridge()?.signOut();
    identity = null;
    resetConsent();
    ui["account-name"].textContent = "";
    ui["account-email"].textContent = "";
    ui["account-uid"].textContent = "";
    void waitForConnection(true);
  }

  ui.language.addEventListener("change", () => {
    if (busy || !Object.hasOwn(MESSAGES, ui.language.value)) {
      ui.language.value = language;
      return;
    }
    language = ui.language.value;
    renderLanguage();
  });
  ui["sign-in"].addEventListener("click", signIn);
  ui["sign-out"].addEventListener("click", signOut);
  ui["retry-connection"].addEventListener("click", () => {
    if (!busy && !identity) void waitForConnection();
  });
  ui["delete-form"].addEventListener("submit", deleteAccount);
  ui.consent.addEventListener("change", render);
  ui.confirmation.addEventListener("input", render);
  for (const link of document.querySelectorAll(".game-link, .legal-link, .contact-link")) {
    link.addEventListener("click", (event) => {
      if (!complete && (busy || irreversible)) {
        event.preventDefault();
        setStatus("navigationBlocked", "error");
      }
    });
  }
  window.addEventListener("beforeunload", (event) => {
    if (!complete && (irreversible || (busy && identity))) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  renderLanguage();
  void waitForConnection();
})();

