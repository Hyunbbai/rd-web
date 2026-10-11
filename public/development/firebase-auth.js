/* 로그인 지속·갱신은 Firebase SDK가 소유하고 게임에는 단기 ID 토큰만 전달한다. */
(() => {
  "use strict";
  const config = null;
  let auth,
    sdk,
    ready = false,
    generation = 0,
    busy = false;
  let operation = null,
    clearing = null,
    signOutRequested = false;
  let authRequestId = "";
  let deletion = null,
    deletedUid = "";
  let initialization = Promise.resolve(),
    restoration = null;
  const errorCode = (error) => {
    if (
      ["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(
        error?.code,
      )
    )
      return "cancelled";
    if (["auth/network-request-failed", "auth/timeout"].includes(error?.code))
      return "network";
    if (
      [
        "auth/unauthorized-domain",
        "auth/operation-not-allowed",
        "auth/invalid-api-key",
        "auth/popup-blocked",
      ].includes(error?.code)
    )
      return "not_configured";
    if (["auth/credential-already-in-use", "auth/email-already-in-use", "auth/account-exists-with-different-credential"].includes(error?.code)) return "account_conflict";
    if (error?.code === "auth/user-mismatch") return "user_mismatch";
    if (error?.code === "auth/requires-recent-login")
      return "recent_login_required";
    if (
      [
        "auth/no-current-user",
        "auth/user-token-expired",
        "auth/user-not-found",
        "auth/user-disabled",
      ].includes(error?.code)
    )
      return "signed_out";
    return "auth_failed";
  };
  const reply = (callback, requestId, value) =>
    callback(JSON.stringify({ ...value, request_id: requestId }));
  const sameUser = (user) => !!user && auth?.currentUser?.uid === user.uid;
  const validUid = (uid) =>
    typeof uid === "string" && uid.length > 0 && uid.length <= 128;
  const deletionResult = (uid) => ({
    ok: true,
    uid,
    project_id: config.projectId,
    deleted: true,
  });
  async function deliver(user, callback, epoch, requestId, refresh = false) {
    if (!sameUser(user)) throw { code: "auth/no-current-user" };
    const idToken = await user.getIdToken(refresh);
    if (epoch !== generation) return;
    if (!sameUser(user)) throw { code: "auth/no-current-user" };
    reply(callback, requestId, {
      ok: true,
      uid: user.uid,
      is_anonymous: user.isAnonymous === true,
      id_token: idToken,
      display_name: user.displayName || "",
      email: user.email || "",
      project_id: config.projectId,
      play_games_linked: user.providerData.some(
        (provider) => provider.providerId === "playgames.google.com",
      ),
    });
  }
  globalThis.FirebaseAuth = {
    localIdentity() {
      const user = ready ? auth?.currentUser : null;
      return JSON.stringify(user ? { uid: user.uid, is_anonymous: user.isAnonymous === true, project_id: config.projectId } : {});
    },
    getProjectId() {
      return typeof config?.projectId === "string" ? config.projectId : "";
    },
    isAvailable() {
      return ready && !clearing && !busy;
    },
    restoreSession(requestId, callback) {
      if (busy || clearing) {
        reply(callback, requestId, { ok: false, error: "busy" });
        return;
      }
      busy = true;
      const epoch = ++generation;
      const current = { requestId, epoch };
      restoration = current;
      let restoringUser = null;
      // 엔진보다 SDK 준비가 늦어져도 저장된 인증 상태를 읽은 뒤 한 번만 복구한다.
      operation = (async () => {
        await initialization;
        if (epoch !== generation) return;
        if (!ready) throw { code: "auth/operation-not-allowed" };
        const user = auth.currentUser;
        restoringUser = user;
        if (
          !user || (!user.isAnonymous &&
          !user.providerData.some((provider) => provider.providerId === "google.com"))
        ) throw { code: "auth/no-current-user" };
        // 저장된 UID만 신뢰하지 않고 새 토큰을 발급받아 서버 접근을 검증한다.
        await deliver(user, callback, epoch, requestId, true);
      })()
        .catch(async (error) => {
          if (epoch !== generation) return;
          const code = errorCode(error);
          // 일시적인 연결 실패는 다음 실행의 자동 로그인 정보를 없애지 않는다.
          if (code === "signed_out" && sameUser(restoringUser))
            await sdk.signOut(auth).catch(() => { ready = false; });
          if (epoch === generation)
            reply(callback, requestId, { ok: false, error: code });
        })
        .finally(() => {
          if (restoration === current) {
            restoration = null;
            busy = false;
          }
        });
    },
    cancelRestore(requestId) {
      if (!restoration || restoration.requestId !== requestId) return;
      generation++;
      restoration = null;
      operation = null;
      busy = false;
    },
    anonymousSignIn(requestId, callback) {
      if (!ready || busy || clearing) {
        reply(callback, requestId, { ok: false, error: ready ? "busy" : "not_configured" });
        return;
      }
      busy = true;
      authRequestId = requestId;
      const epoch = ++generation;
      // 기존 SDK 사용자를 먼저 재사용해 재시도마다 게스트 UID를 만들지 않는다.
      operation = (async () => {
        const user = auth.currentUser || (await sdk.signInAnonymously(auth)).user;
        if (epoch === generation) await deliver(user, callback, epoch, requestId);
      })().catch((error) => {
        if (epoch === generation) reply(callback, requestId, { ok: false, error: errorCode(error) });
      }).finally(() => { busy = false; authRequestId = ""; });
    },
    cancelAuth(requestId) {
      if (authRequestId !== requestId) return;
      // SDK 변경은 취소할 수 없다. 세션을 지우지 않고 완료까지 새 요청을 막는다.
      generation++;
      authRequestId = "";
    },
    googleSignIn(requestId, callback) {
      this.startGoogleSignIn(requestId, callback, false);
    },
    googleSignInExisting(requestId, callback) {
      this.startGoogleSignIn(requestId, callback, true);
    },
    startGoogleSignIn(requestId, callback, existing) {
      if (!ready || busy || clearing) {
        reply(callback, requestId, { ok: false, error: ready ? "busy" : "not_configured" });
        return;
      }
      deletedUid = "";
      busy = true;
      signOutRequested = false;
      authRequestId = requestId;
      const epoch = ++generation;
      const user = auth.currentUser;
      const linking = !!user?.isAnonymous && !existing;
      const provider = new sdk.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      // popup은 입력 이벤트에서 즉시 열며, 연결 실패·취소 때 게스트 세션을 보존한다.
      // linkWithPopup은 SDK 내부에서 현재 UID에 Google credential을 연결한다.
      operation = (linking
        ? sdk.linkWithPopup(user, provider, sdk.browserPopupRedirectResolver)
        : sdk.signInWithPopup(auth, provider, sdk.browserPopupRedirectResolver))
        .then(async (result) => {
          if (epoch !== generation) return;
          if (linking && result.user.uid !== user.uid) throw { code: "auth/user-mismatch" };
          await deliver(result.user, callback, epoch, requestId);
        })
        .catch((error) => {
          if (epoch === generation)
            reply(callback, requestId, { ok: false, error: errorCode(error) });
        })
        .finally(() => { busy = false; authRequestId = ""; });
    },
    reauthenticate(requestId, expectedUid, callback) {
      if (!ready) {
        reply(callback, requestId, { ok: false, error: "not_configured" });
        return;
      }
      if (busy || clearing) {
        reply(callback, requestId, { ok: false, error: "busy" });
        return;
      }
      const user = auth.currentUser;
      if (!user) {
        reply(callback, requestId, { ok: false, error: "signed_out" });
        return;
      }
      if (!validUid(expectedUid) || user.uid !== expectedUid) {
        reply(callback, requestId, { ok: false, error: "user_mismatch" });
        return;
      }
      if (
        !user.providerData.some(
          (provider) => provider.providerId === "google.com",
        )
      ) {
        reply(callback, requestId, { ok: false, error: "auth_failed" });
        return;
      }
      busy = true;
      authRequestId = requestId;
      const epoch = ++generation;
      const provider = new sdk.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      // 확인 버튼의 입력 이벤트 안에서 popup을 즉시 연다. signIn으로 계정을 바꾸지 않는다.
      operation = sdk
        .reauthenticateWithPopup(
          user,
          provider,
          sdk.browserPopupRedirectResolver,
        )
        .then(async (result) => {
          if (epoch !== generation) return;
          if (result.user.uid !== expectedUid || !sameUser(user))
            throw { code: "auth/user-mismatch" };
          await deliver(user, callback, epoch, requestId, true);
        })
        .catch((error) => {
          if (epoch === generation)
            reply(callback, requestId, { ok: false, error: errorCode(error) });
        })
        .finally(() => {
          busy = false;
          authRequestId = "";
        });
    },
    deleteAccount(requestId, expectedUid, callback) {
      if (!validUid(expectedUid)) {
        reply(callback, requestId, { ok: false, error: "user_mismatch" });
        return;
      }
      if (deletion) {
        if (deletion.uid !== expectedUid) {
          reply(callback, requestId, { ok: false, error: "busy" });
          return;
        }
        // HTTP 응답 대기 시간이 지나도 이미 보낸 삭제를 중복 실행하지 않는다.
        deletion.waiters.push({ callback, requestId });
        return;
      }
      if (deletedUid === expectedUid) {
        reply(callback, requestId, deletionResult(expectedUid));
        return;
      }
      if (!ready) {
        reply(callback, requestId, { ok: false, error: "not_configured" });
        return;
      }
      if (busy || clearing) {
        reply(callback, requestId, { ok: false, error: "busy" });
        return;
      }
      const user = auth.currentUser;
      if (!user) {
        reply(callback, requestId, { ok: false, error: "signed_out" });
        return;
      }
      if (user.uid !== expectedUid) {
        reply(callback, requestId, { ok: false, error: "user_mismatch" });
        return;
      }
      busy = true;
      const current = { uid: expectedUid, waiters: [{ callback, requestId }] };
      deletion = current;
      // deleteUser는 성공 시 SDK 세션도 로그아웃한다. 시작 후 signOut으로 취소할 수 없다.
      let task;
      try {
        task = sdk.deleteUser(user);
      } catch (error) {
        task = Promise.reject(error);
      }
      operation = Promise.resolve(task)
        .then(
          () => {
            deletedUid = expectedUid;
            return deletionResult(expectedUid);
          },
          (error) => ({ ok: false, error: errorCode(error) }),
        )
        .then((result) => {
          deletion = null;
          busy = false;
          for (const waiter of current.waiters) {
            try {
              reply(waiter.callback, waiter.requestId, result);
            } catch (_) {
              /* 종료된 Godot 콜백이 다음 대기자의 결과를 막지 않게 한다. */
            }
          }
        });
    },
    requestToken(requestId, callback) {
      const epoch = generation;
      if (!ready || clearing || busy) {
        reply(callback, requestId, { ok: false, error: "not_configured" });
        return;
      }
      deliver(auth.currentUser, callback, epoch, requestId).catch((error) => {
        if (epoch === generation)
          reply(callback, requestId, { ok: false, error: errorCode(error) });
      });
    },
    signOut() {
      generation++;
      signOutRequested = true;
      if (!auth || clearing) return;
      const previous = operation;
      // 늦게 완료된 popup이 Firebase currentUser를 되살리는 경우도 마지막에 다시 정리한다.
      clearing = (async () => {
        await sdk.signOut(auth);
        if (previous) await previous;
        await sdk.signOut(auth);
      })()
        .catch(() => {
          ready = false;
        })
        .finally(() => {
          clearing = null;
          operation = null;
          busy = false;
        });
    },
  };
  if (!config) return;
  // 버전을 고정하고 엔진 로딩과 병렬로 준비한다. 설정이 없는 개발 빌드는 SDK를 받지 않는다.
  initialization = Promise.all([
    import("https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"),
  ])
    .then(async ([appSdk, authSdk]) => {
      sdk = authSdk;
      // 같은 브라우저·사이트의 로그인은 SDK 저장소에서 복원한다. 자체 토큰 파일은 만들지 않는다.
      // 저장소가 차단된 환경은 메모리로 동작하며 popup은 명시적 로그인에서만 연다.
      auth = sdk.initializeAuth(appSdk.initializeApp(config, "guild-account"), {
        persistence: [sdk.indexedDBLocalPersistence, sdk.browserLocalPersistence, sdk.inMemoryPersistence],
      });
      await auth.authStateReady();
      if (signOutRequested) await sdk.signOut(auth);
      ready = true;
    })
    .catch(() => {
      ready = false;
    });
})();
