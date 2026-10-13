/**
 * 인앱 브라우저(카카오톡·인스타그램·페이스북·네이버·라인·다음 등) 탈출 — 모바일에서 링크를 타고 들어오면 크롬으로 보낸다.
 * <head> 맨 앞에 인라인으로 넣어 첫 그리기 전에 실행된다 (React 밖, 의존성 없음).
 * - Android: intent://…#Intent;scheme=https;package=com.android.chrome;end (크롬이 없으면 플레이스토어/브라우저 선택)
 * - iOS: googlechromes:// 로 크롬을 열고, 1.2초 안에 안 떠나면 카카오톡은 openExternal(기본 브라우저), 그 외는 그대로 둔다
 *   (iOS는 앱이 강제로 다른 앱을 열 수 없어 100% 보장은 불가)
 * - ?noapp=1 로 들어오면 건너뛴다(무한 루프 방지). 세션당 한 번만 시도.
 */
export const INAPP_REDIRECT_SCRIPT = `(function(){try{
var ua=navigator.userAgent||"";
if(!/Android|iPhone|iPad|iPod/i.test(ua))return;
if(!/KAKAOTALK|Instagram|FBAN|FBAV|FB_IAB|NAVER\(inapp|Line\/|DaumApps|Daum\/|Whale\/.*Mobile.*inapp|trill|Snapchat|BytedanceWebview|everytimeApp|SamsungBrowser\/[0-9.]+ .*inapp/i.test(ua))return;
var url=location.href;
if(/[?&]noapp=1/.test(url))return;
if(sessionStorage.getItem("inapp-redirected"))return;
sessionStorage.setItem("inapp-redirected","1");
var sep=url.indexOf("?")>-1?"&":"?";
var target=url+sep+"noapp=1";
if(/Android/i.test(ua)){
  var bare=target.replace(/^https?:\/\//,"");
  location.replace("intent://"+bare+"#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url="+encodeURIComponent(target)+";end");
  return;
}
var left=false;
var onHide=function(){left=true;};
document.addEventListener("visibilitychange",onHide);
window.addEventListener("pagehide",onHide);
location.href="googlechromes://"+target.replace(/^https?:\/\//,"");
setTimeout(function(){
  if(left||document.hidden)return;
  if(/KAKAOTALK/i.test(ua))location.href="kakaotalk://web/openExternal?url="+encodeURIComponent(target);
},1200);
}catch(e){}})();`;
