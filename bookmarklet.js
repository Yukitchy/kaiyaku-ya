/* 解約屋 とりこみボタン（ブックマークレットの元ソース）
   Gmailの検索結果画面で実行 → 課金っぽい行だけ抜いてクリップボードへ。
   配布用の1行版は bookmarklet.txt を参照。 */
(function () {
  var rows = document.querySelectorAll('tr.zA');
  if (!rows.length) {
    alert('Gmailの検索結果の画面で押してください。\n（メールを開いている時は使えません）');
    return;
  }
  var KW = /領収|請求|支払|決済|購入|更新|継続|課金|プラン|subscription|receipt|invoice|payment|billing|renew|plan/i;
  var all = [], hit = [];
  for (var i = 0; i < rows.length; i++) {
    var s = rows[i].querySelector('span[email]');
    var b = rows[i].querySelector('.bog');
    var from = s ? (s.getAttribute('email') || s.textContent || '') : '';
    var subj = b ? (b.textContent || '') : '';
    var line = (from + '  ' + subj).trim();
    if (line.length < 4) continue;
    all.push(line);
    if (KW.test(line)) hit.push(line);
  }
  // 課金っぽい行が拾えなければ全部渡す（取りこぼすより多い方がマシ）
  var out = hit.length ? hit : all;
  var text = out.join('\n');
  var done = function () {
    alert(out.length + '件コピーしました。\n解約屋のページを開いて、貼り付け欄で ⌘V（WindowsはCtrl+V）。');
  };

  // ① クリップボードAPI（選択もcopyイベントも経由しないので一番確実）
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, legacy);
    return;
  }
  legacy();

  // ② copyイベントをcapture段階で奪い、自分のテキストを書き込む
  //    （Gmailは自前のcopyハンドラを持っていて、放っておくと上書きされる）
  function legacy() {
    var wrote = false;
    var grab = function (e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.clipboardData.setData('text/plain', text);
      wrote = true;
    };
    document.addEventListener('copy', grab, true);
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
    document.removeEventListener('copy', grab, true);
    if (wrote) { done(); return; }
    panel();
  }

  // ③ 最後の砦: 画面に出して手でコピーしてもらう（ここまで来れば必ず取れる）
  function panel() {
  var bg = document.createElement('div');
  bg.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center';
  var box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:12px;padding:18px;width:min(680px,90vw);font:14px/1.6 sans-serif;color:#111';
  box.innerHTML = '<b>' + out.length + '件ぶん取り出しました</b><br>自動コピーが効かなかったので、下の枠で <b>⌘A → ⌘C</b> してください。<br>';
  var big = document.createElement('textarea');
  big.value = text;
  big.style.cssText = 'width:100%;height:220px;margin-top:10px;font:12px/1.5 monospace;padding:8px';
  var close = document.createElement('button');
  close.textContent = '閉じる';
  close.style.cssText = 'margin-top:10px;padding:7px 18px;border:0;border-radius:8px;background:#0f6e56;color:#fff;cursor:pointer';
  close.onclick = function () { bg.remove(); };
  box.appendChild(big); box.appendChild(close); bg.appendChild(box);
  document.body.appendChild(bg);
  big.focus(); big.select();
  }
})();
