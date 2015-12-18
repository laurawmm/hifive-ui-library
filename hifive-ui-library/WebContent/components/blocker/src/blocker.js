/*
 * Copyright (C) 2015 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* ------ h5.ui ------ */
(function() {
	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	// =============================
	// Production
	// =============================
	// h5scopeglobalsから
	/**
	 * undefinedかどうかの判定で、typeofで判定する
	 *
	 * @private
	 */
	var TYPE_OF_UNDEFINED = 'undefined';

	/**
	 * Node.DOCUMENT_NODE。IE8-ではNodeがないので自前で定数を作っている
	 *
	 * @private
	 */
	var NODE_TYPE_DOCUMENT = 9;


	/**
	 * ブロッカー - ルートのクラス名
	 */
	var CLASS_INDICATOR_ROOT = 'h5-ui-blocker';

	/**
	 * ブロッカー - オーバーレイのクラス名
	 */
	var CLASS_OVERLAY = 'overlay';

	/**
	 * インジケータ - オーバーレイのクラス名
	 * <p>
	 * IE6でのみ使用する。
	 */
	var CLASS_SKIN = 'skin';

	/**
	 * アニメーション(fadeIn,fadeOut)するときの1フレームの時間(ms)
	 * <p>
	 * jQuery.fx.intervalがデフォルトで13なので、それに倣って13を指定している
	 * </p>
	 */
	var ANIMATION_INTERVAL = 13;

	/**
	 * wheelイベント名(クロスブラウザ対応)
	 */
	var WHEEL_EVENT_NAME = 'onwheel' in document ? 'wheel'
			: 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';

	// =============================
	// Development Only
	// =============================

	/* del begin */
	/* del end */

	// =========================================================================
	//
	// Cache
	//
	// =========================================================================
	var h5ua = h5.env.ua;
	var isJQueryObject = h5.u.obj.isJQueryObject;
	var argsToArray = h5.u.obj.argsToArray;

	// =========================================================================
	//
	// Privates
	//
	// =========================================================================

	// =============================
	// Variables
	// =============================
	/**
	 * 互換モードか判定します
	 */
	var compatMode = (document.compatMode !== 'CSS1Compat');

	/**
	 * 対象ブラウザがIE6以前のブラウザか
	 */
	var isLegacyIE = h5ua.isIE && h5ua.browserVersion <= 6;

	/**
	 * position:fixedでブロッカーを描画するかのフラグ。
	 * <p>
	 * 自動更新またはアップデート可能なブラウザは、最新のブラウザであるものとして判定しない。(常にposition:fixedは有効とする)
	 * <p>
	 * 以下の理由から、機能ベースでの判定は行わない。
	 * <ul>
	 * <li>$.support.fixedPosition()にバグがあり、モバイルブラウザの判定が正しくない。</li>
	 * <li>jQuery1.8では、$.support.fixedPosition()が無くなっている。 (fixedPositionを判定するAPIが無い)</li>
	 * <li>機能ベースでモバイル・デスクトップの両方を検知するのは困難。</li>
	 * </ul>
	 * <p>
	 * <b>position:fixedについて</b>
	 * <ul>
	 * <li>position:fixed対応表: http://caniuse.com/css-fixed</li>
	 * <li>Androidは2.2からposition:fixedをサポートしており、2.2と2.3はmetaタグに「user-scalable=no」が設定されていないと機能しない。<br>
	 * http://blog.webcreativepark.net/2011/12/07-052517.html </li>
	 * <li>Androidのデフォルトブラウザでposition:fixedを使用すると、2.xはkeyframesとtransformをposition:fixedで使用すると正しい位置に表示されないバグが、4.xは画面の向きが変更されると描画が崩れるバグがあるため使用しない。
	 * <li>Windows Phoneは7.0/7.5ともに未サポート https://github.com/jquery/jquery-mobile/issues/3489</li>
	 * <ul>
	 */
	var usePositionFixed = !(h5ua.isAndroidDefaultBrowser
			|| (h5ua.isiOS && h5ua.browserVersion < 5) || isLegacyIE || compatMode || h5ua.isWindowsPhone);

	/**
	 * ウィンドウの高さを取得するメソッド
	 */
	var windowHeight = null;

	/**
	 * ドキュメントの高さを取得するメソッド
	 */
	var documentHeight = null;

	/**
	 * ドキュメントの高さを取得するメソッド
	 */
	var documentWidth = null;

	/**
	 * Y方向のスクロール値を取得するメソッド
	 */
	var scrollTop = null;

	/**
	 * Y方向のスクロール値を取得するメソッド
	 */
	var scrollLeft = null;

	// =============================
	// Functions
	// =============================
	// h5scopeglobalsからコピペ
	// -------------------------------------- ここから -------------------------------------- //
	/**
	 * ノードからドキュメントを取得。
	 * <p>
	 * 引数がdocumentノードなら引数をそのまま、ノードならownerDocument、windowオブジェクトならそのdocumentを返します。nodeがいずれにも該当しない場合はnullを返します。
	 * </p>
	 *
	 * @private
	 * @param {DOM} node
	 * @returns {Document} documentオブジェクト
	 */
	function getDocumentOf(node) {
		if (typeof node.nodeType === TYPE_OF_UNDEFINED) {
			// ノードではない
			if (isWindowObject(node)) {
				// windowオブジェクトならwindow.documentを返す
				return node.document;
			}
			return null;
		}
		if (node.nodeType === NODE_TYPE_DOCUMENT) {
			// nodeがdocumentの場合
			return node;
		}
		// nodeがdocument以外(documentツリー属するノード)の場合はそのownerDocumentを返す
		return node.ownerDocument;
	}
	/**
	 * 引数が配列かどうか判定
	 * <p>
	 * Array.isArrayがあるブラウザの場合はisArray===Array.isArrayです
	 * </p>
	 *
	 * @private
	 * @param {Any} obj
	 * @returns {Boolean}
	 */
	var isArray = Array.isArray || (function() {
		// プロパティアクセスを減らすため、toStringをキャッシュ
		var toStringObj = Object.prototype.toString;
		return function(obj) {
			return toStringObj.call(obj) === '[object Array]';
		};
	})();

	/**
	 * documentオブジェクトからwindowオブジェクトを取得
	 *
	 * @private
	 * @param {Document} doc
	 * @returns {Window} windowオブジェクト
	 */
	function getWindowOfDocument(doc) {
		// IE8-だと、windowとwindow.document.parentWindowで、同じwindowを指すが、"==="で比較するとfalseになる (#339)
		// イベントハンドラをバインドするターゲットがwindowである時は、window.document.parentWindowではなく
		// windowにバインドして、イベントハンドラのthis(コントローライベントハンドラの第２引数)をwindowにするため、
		// window.document === doc の場合はparentWindowではなくwindowを返すようにしている

		// IE8-ではdocument.parentWindow、それ以外はdoc.defaultViewでwindowオブジェクトを取得
		return window.document === doc ? window : doc.defaultView || doc.parentWindow;
	}

	/**
	 * ノードからwindowオブジェクトを取得
	 *
	 * @private
	 * @param {DOM} node
	 * @returns {Window} windowオブジェクト
	 */
	function getWindowOf(node) {
		return getWindowOfDocument(getDocumentOf(node));
	}

	/**
	 * 引数が関数かどうか判定
	 *
	 * @private
	 * @param {Any} obj
	 * @returns {Boolean}
	 */
	var isFunction = (function() {
		// Android3以下、iOS4以下は正規表現をtypeofで判定すると"function"を返す
		// それらのブラウザでは、toStringを使って判定する
		if (typeof new RegExp() === 'function') {
			var toStringObj = Object.prototype.toString;
			return function(obj) {
				return toStringObj.call(obj) === '[object Function]';
			};
		}
		// 正規表現のtypeofが"function"にならないブラウザなら、typeofがfunctionなら関数と判定する
		return function(obj) {
			return typeof obj === 'function';
		};
	})();

	/**
	 * promiseのメソッド呼び出しを_h5UnwrappedCallを使って行います。 jQueryのpromiseが渡されたらそのまま実行します。
	 *
	 * @private
	 * @param {Deferred|Promise} promise
	 * @param {String} method
	 * @param {Array|Any} args 複数の引数があるときは配列で渡します。
	 */
	function registerCallbacksSilently(promise, method, args) {
		if (promise) {
			promise._h5UnwrappedCall ? promise._h5UnwrappedCall(method, args) : promise[method]
					(args);
		}
	}
	// -------------------------------------- ここまで -------------------------------------- //

	/**
	 * 指定されたCSS3プロパティをサポートしているか判定します。
	 * <p>
	 * プレフィックスなし、プレフィックスありでサポート判定を行います。
	 * <p>
	 * 判定に使用するプレフィックス
	 * <ul>
	 * <li>Khtml (Safari2以前)</li>
	 * <li>ms (IE)</li>
	 * <li>O (Opera)</li>
	 * <li>Moz (Firefox)</li>
	 * <li>Webkit (Safari2以降/Chrome)</li>
	 * </ul>
	 * <p>
	 * ※Chrome20にて、WebKitプレフィックスはデバッグでの表示上は小文字(webkitXxxxx)だが、先頭文字が小文字または大文字でも正しく判定される。
	 * しかし、古いバージョンでは確認できていないため『Webkit』で判定する。
	 */
	var supportsCSS3Property = (function() {
		var fragment = document.createDocumentFragment();
		var div = fragment.appendChild(document.createElement('div'));
		var prefixes = 'Webkit Moz O ms Khtml'.split(' ');
		var len = prefixes.length;

		return function(propName) {
			// CSSシンタックス(ハイフン区切りの文字列)をキャメルケースに変換
			var propCamel = $.camelCase(propName);

			// ベンダープレフィックスなしでサポートしているか判定
			if (propCamel in div.style) {
				return true;
			}

			propCamel = propCamel.charAt(0).toUpperCase() + propCamel.slice(1);

			// ベンダープレフィックスありでサポートしているか判定
			for (var i = 0; i < len; i++) {
				if (prefixes[i] + propCamel in div.style) {
					return true;
				}
			}

			return false;
		};
	})();

	/**
	 * 任意要素のスクロールサイズ(scrollWidth/Height：見た目でなくコンテンツ全体のサイズ)を取得します。
	 * IE6は内包する要素の方が小さい場合にscrollサイズがclientサイズより小さくなってしまうバグがあります（本来はscroll===client）。
	 * そこで、IE6の場合はscrollとclientのうち大きい方のサイズを返します。<br>
	 * また、scrollW/Hは整数を返しますが、内部的にはサイズが小数になっている場合があります。Chrome22, Firefox20,
	 * Opera12ではscrollサイズをセットしても問題ありませんが、IEの場合
	 * (内部サイズが小数のときに)scrollW/Hの大きさでオーバーレイのサイズを設定すると意図しないスクロールバーが出てしまう場合があります。
	 * このメソッドは、IEかつ内部に小数を取り得る環境と判断した場合この誤差を調整してこの問題を回避します。
	 *
	 * @private
	 * @param elem {Element} DOM要素
	 * @returns {Object}
	 */
	function getScrollSize(elem) {
		var retW = elem.scrollWidth;
		var retH = elem.scrollHeight;

		if (isLegacyIE) {
			retW = Math.max(retW, elem.clientWidth);
			retH = Math.max(retH, elem.clientHeight);
		} else if (h5ua.isIE && typeof getComputedStyle === 'function') {
			//getComputedStyleが未定義な環境(IE)でエラーにならないように、typeofを使って判定

			//IE9以上(かつIE9モード以上)。この場合、ボックスサイズが小数になる可能性がある
			//(IE8orIE8モード以下の場合常に整数で計算されるので、scrollサイズを使えばよい)。
			//ComputedStyleで厳密なサイズを取得し、その分を調整することで
			//意図しないスクロールバーが出ないようにする。
			//-1しているのは四捨五入させるため(描画の際はピクセルにスナップされるようなので)。

			// エレメントが別ウィンドウの場合もあるので、elemの属するwindowのgetComputedStyleを使用
			var comStyle = getWindowOfDocument(getDocumentOf(elem)).getComputedStyle(elem, null);

			var eW = parseFloat(comStyle.width) + parseFloat(comStyle.paddingLeft)
					+ parseFloat(comStyle.paddingRight);
			retW += eW - parseInt(eW) - 1;

			var eH = parseFloat(comStyle.height) + parseFloat(comStyle.paddingTop)
					+ parseFloat(comStyle.paddingBottom);
			retH += eH - parseInt(eH) - 1;
		}

		return {
			w: retW,
			h: retH
		};
	}

	/**
	 * ドキュメント(コンテンツ全体)の高さまたは幅を取得します。
	 * <p>
	 * ウィンドウの高さを取得したい場合は引数に"Height"を、 ウィンドウの幅を取得したい場合は引数に"Width"を指定して下さい。
	 * <p>
	 * 以下のバグがあるため自前で計算を行う。
	 * <p>
	 * 1.6.4/1.7.1/1.8.0は正しい値を返すが1.7.1ではバグがあるため正しい値を返さない。<br>
	 * http://bugs.jquery.com/ticket/3838<br>
	 * http://pastebin.com/MaUuLjU2
	 * <p>
	 * IE6だと同一要素に対してスタイルにwidthとpaddingを指定するとサイズがおかしくなる。<br>
	 * http://hiromedo-net.sakura.ne.jp/memoblog/?p=47
	 */
	function documentSize(propName) {
		var prop = propName;

		return function() {
			var body = document.body;
			var docElem = document.documentElement;
			// 互換モードの場合はサイズ計算にbody要素を、IE6標準の場合はdocumentElementを使用する
			var elem = compatMode ? body : isLegacyIE ? docElem : null;

			if (elem) {
				if (prop === 'Height') {
					// ウィンドウサイズを大きくすると、scroll[Width/Height]よりもclient[Width/Height]の値のほうが大きくなるため、
					// client[Width/Height]のほうが大きい場合はこの値を返す
					return elem['client' + prop] > elem['scroll' + prop] ? elem['client' + prop]
							: elem['scroll' + prop];
				}
				return elem['client' + prop];
			}
			return Math.max(body['scroll' + prop], docElem['scroll' + prop], body['offset' + prop],
					docElem['offset' + prop], docElem['client' + prop]);

		};
	}

	/**
	 * スクロールバーの幅も含めた、ウィンドウ幅または高さを取得します。
	 * <p>
	 * ウィンドウの高さを取得したい場合は引数に"Height"を、 ウィンドウの幅を取得したい場合は引数に"Width"を指定して下さい。
	 * <p>
	 * jQuery1.8からQuirksモードをサポートしていないため、$(window).height()からウィンドウサイズを取得できない(0を返す)ため、自前で計算を行う。<br>
	 * http://blog.jquery.com/2012/08/30/jquery-1-8-1-released/
	 */
	function windowSize(propName) {
		var prop = propName;

		return function() {
			var body = document.body;
			var docElem = document.documentElement;
			return (typeof window['inner' + prop] === 'number') ? window['inner' + prop]
					: compatMode ? body['client' + prop] : docElem['client' + prop];
		};
	}

	/**
	 * Y方向またはX方向のスクロール量を取得します。
	 * <p>
	 * Y方向のスクロール量を取得したい場合は引数に"Top"を、 X方向のスクロール量を取得したい場合は引数に"Left"を指定して下さい。
	 */
	function scrollPosition(propName) {
		var prop = propName;

		return function() {
			// doctypeが「XHTML1.0 Transitional DTD」だと、document.documentElement.scrollTopが0を返すので、互換モードを判定する
			// http://mokumoku.mydns.jp/dok/88.html
			var elem = compatMode ? document.body : document.documentElement;
			var offsetProp = (prop === 'Top') ? 'Y' : 'X';
			return window['page' + offsetProp + 'Offset'] || elem['scroll' + prop];
		};
	}

	/**
	 * スクロールバーの幅を含めない、ウィンドウ幅または高さを取得します。
	 */
	function getDisplayArea(prop) {
		var e = compatMode ? document.body : document.documentElement;
		return h5ua.isiOS ? window['inner' + prop] : e['client' + prop];
	}

	/**
	 * 指定された要素の左上からの絶対座標を取得します。
	 * <p>
	 * 1.8.xのjQuery.offset()は、Quirksモードでのスクロール量の計算が正しく行われないため自前で計算する。
	 * </p>
	 * <p>
	 * 絶対座標は、
	 *
	 * <pre>
	 * getBoundingClinetRectの値 + スクロール量 - clientTop / Left
	 * </pre>
	 *
	 * で計算します。
	 * </p>
	 * <p>
	 * IE6の場合、BODY要素についてgetBoundingClientRect()の値が正しく計算できず、
	 * また、HTML要素のmargin,borderが表示されないので、BODY要素の場合は、htmlのpadding～bodyのborderまでを加えた値を計算して返します。
	 * </p>
	 */
	function getOffset(element) {
		var elem = $(element)[0];
		var body = document.body;
		var html = $('html')[0];
		var box = {
			top: 0,
			left: 0
		};
		if (elem === body && isLegacyIE) {
			return {
				top: parseFloat(html.currentStyle.paddingTop || 0)
						+ parseFloat(body.currentStyle.marginTop || 0)
						+ parseFloat(body.currentStyle.borderTop || 0),
				left: parseFloat(html.currentStyle.paddingLeft || 0)
						+ parseFloat(body.currentStyle.marginLeft || 0)
						+ parseFloat(body.currentStyle.borderLeft || 0)
			};
		}

		if (typeof elem.getBoundingClientRect !== "undefined") {
			box = elem.getBoundingClientRect();
		}

		var docElem = compatMode ? body : document.documentElement;
		var clientTop = docElem.clientTop || 0;
		var clientLeft = docElem.clientLeft || 0;

		return {
			top: box.top + scrollTop() - clientTop,
			left: box.left + scrollLeft() - clientLeft
		};

	}

	/**
	 * 指定された要素で発生したイベントを無効にする
	 */
	function disableEventOnBlocker(/* var_args */) {
		var disabledEventTypes = WHEEL_EVENT_NAME
				+ ' click dblclick touchstart touchmove touchend mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave focus focusin focusout blur change select';

		$.each(argsToArray(arguments), function(i, e) {
			e.bind(disabledEventTypes, function() {
				return false;
			});
		});
	}

	/**
	 * スクリーンロック対象の要素か判定します。
	 */
	function isScreenlockTarget(element) {
		var e = isJQueryObject(element) ? element[0] : element;
		return e === window || e === document || e === document.body;
	}

	/**
	 * getComputedStyleがあるブラウザについて、getComputedStyleを呼び出した結果を返します。
	 * <p>
	 * 渡されたエレメントが属するdocumentツリーのwindowオブジェクトのgetComputedStyleを使用します
	 * </p>
	 *
	 * @private
	 * @param {DOM} elem
	 * @returns {Style} elemのcomputedStyle
	 */
	function getComputedStyleObject(elem) {
		return getWindowOf(elem).getComputedStyle(elem, null);
	}

	/**
	 * スタイルを取得する
	 * <p>
	 * IEでjQuery1.8.X～1.10.Xを使用した時、ポップアップウィンドウ内の要素についてスタイルを取得しようとするとエラーになるため、ラップしている。
	 * </p>
	 * <p>
	 * getComputedStyleがないブラウザについては、jQuery.css()を使って取得した値を返す。
	 * </p>
	 *
	 * @private
	 * @param elem {DOM}
	 * @param prop {String} CSSプロパティ
	 * @returns 第1引数について、computedStyleを取得し、第2引数に指定されたプロパティの値を返す
	 */
	function getComputedStyleValue(elem, prop) {
		if (!getWindowOf(elem).getComputedStyle) {
			return $(elem).css(prop);
		}
		return getComputedStyleObject(elem)[prop];
	}

	/**
	 * 要素のheight(offsetHeight)を取得する
	 * <p>
	 * IEでjQuery1.8.X～1.10.Xを使用した時、ポップアップウィンドウ内の要素についてスタイルを取得しようとするとエラーになるため、ラップしている。
	 * </p>
	 * <p>
	 * getComputedStyleがないブラウザについては、height()で取得した値を返す。
	 * </p>
	 *
	 * @private
	 * @param {DOM} elem
	 * @returns {Number} 引数で渡された要素のheight
	 */
	function getHeight(elem) {
		if (!getWindowOf(elem).getComputedStyle) {
			return $(elem).height();
		}
		var elemStyle = getComputedStyleObject(elem);
		return elem.offsetHeight - parseFloat(elemStyle.paddingTop)
				- parseFloat(elemStyle.paddingBottom);
	}

	/**
	 * 要素のwidth(offsetWidth)を取得する
	 * <p>
	 * IEでjQuery1.8.X～1.10.Xを使用した時、ポップアップウィンドウ内の要素についてスタイルを取得しようとするとエラーになるため、ラップしている。
	 * </p>
	 * <p>
	 * getComputedStyleがないブラウザについては、width()で取得した値を返す。
	 * </p>
	 *
	 * @private
	 * @param {DOM} elem
	 * @returns {Number} 引数で渡された要素のwidth
	 */
	function getWidth(elem) {
		if (!getWindowOf(elem).getComputedStyle) {
			return $(elem).width();
		}
		var elemStyle = getComputedStyleObject(elem);
		return elem.offsetWidth - parseFloat(elemStyle.paddingLeft)
				- parseFloat(elemStyle.paddingRight);
	}

	/**
	 * 要素のouterHeightを取得する
	 * <p>
	 * IEでjQuery1.8.X～1.10.Xを使用した時、ポップアップウィンドウ内の要素についてスタイルを取得しようとするとエラーになるため、ラップしている。
	 * </p>
	 * <p>
	 * getComputedStyleがないブラウザについては、outerHeight()で取得した値を返す。
	 * </p>
	 *
	 * @private
	 * @param {DOM} elem
	 * @param {Boolean} [includeMargin=true] maginを含めるかどうか
	 * @returns {Number} 引数で渡された要素のouterHeight
	 */
	function getOuterHeight(elem, includeMargin) {
		if (!getWindowOf(elem).getComputedStyle) {
			return $(elem).outerHeight();
		}

		var elemStyle = getComputedStyleObject(elem);
		return getHeight(elem)
				+ parseFloat(elemStyle.paddingTop)
				+ parseFloat(elemStyle.paddingBottom)
				+ parseFloat(elemStyle.borderTopWidth)
				+ parseFloat(elemStyle.borderBottomWidth)
				+ (includeMargin ? (parseFloat(elemStyle.marginTop) + parseFloat(elemStyle.marginBottom))
						: 0);
	}

	/**
	 * 要素のouterWidthを取得する
	 * <p>
	 * IEでjQuery1.8.X～1.10.Xを使用した時、ポップアップウィンドウ内の要素についてスタイルを取得しようとするとエラーになるため、ラップしている。
	 * </p>
	 * <p>
	 * getComputedStyleがないブラウザについては、outerWidth()で取得した値を返す。
	 * </p>
	 *
	 * @param {DOM} elem
	 * @param {Boolean} [includeMargin=true] maginを含めるかどうか
	 * @returns {Number} 引数で渡された要素のouterWidth
	 */
	function getOuterWidth(elem, includeMargin) {
		if (!getWindowOf(elem).getComputedStyle) {
			return $(elem).outerWidth();
		}
		var elemStyle = getComputedStyleObject(elem);
		return getWidth(elem)
				+ parseFloat(elemStyle.paddingLeft)
				+ parseFloat(elemStyle.paddingRight)
				+ parseFloat(elemStyle.borderLeftWidth)
				+ parseFloat(elemStyle.borderRightWidth)
				+ (includeMargin ? (parseFloat(elemStyle.marginLeft) + parseFloat(elemStyle.marginRight))
						: 0);
	}

	/**
	 * 要素のinnerHeightを取得する
	 * <p>
	 * IEでjQuery1.8.X～1.10.Xを使用した時、ポップアップウィンドウ内の要素についてスタイルを取得しようとするとエラーになるため、ラップしている。
	 * </p>
	 * <p>
	 * getComputedStyleがないブラウザについては、innerHeight()で取得した値を返す。
	 * </p>
	 *
	 * @param {DOM} elem
	 * @returns {Number} 引数で渡された要素のinnerHeight
	 */
	function getInnerHeight(elem) {
		if (!getWindowOf(elem).getComputedStyle) {
			return $(elem).innerHeight();
		}
		var elemStyle = getComputedStyleObject(elem);
		return getHeight(elem) + parseFloat(elemStyle.paddingTop)
				+ parseFloat(elemStyle.paddingBottom);
	}

	/**
	 * 要素のinnerWidthを取得する
	 * <p>
	 * IEでjQuery1.8.X～1.10.Xを使用した時、ポップアップウィンドウ内の要素についてスタイルを取得しようとするとエラーになるため、ラップしている。
	 * </p>
	 * <p>
	 * getComputedStyleがないブラウザについては、innerWidth()で取得した値を返す。
	 * </p>
	 *
	 * @param {DOM} elem
	 * @returns {Number} 引数で渡された要素のinnerWidth
	 */
	function getInnerWidth(elem) {
		if (!getWindowOf(elem).getComputedStyle) {
			return $(elem).innerWidth();
		}
		var elemStyle = getComputedStyleObject(elem);
		return getWidth(elem) + parseFloat(elemStyle.paddingLeft)
				+ parseFloat(elemStyle.paddingRight);
	}

	/**
	 * fadeIn, fadeOut用のアニメーション関数
	 *
	 * @param {Array} props $elemのアニメーション終了時のスタイルの配列。propsの配列のインデックスは$elemのインデックスに対応する。
	 * @param {jQuery} $elem アニメーションさせる要素
	 * @param {Number} time アニメーションに掛ける時間
	 * @param {Function} callback アニメーション終了時に実行するコールバック関数
	 */
	function animate(props, $elem, time, callback) {
		var interval = ANIMATION_INTERVAL;
		var count = 0;
		// 現在の値(アニメーションするごとに変化)
		var curProps = [];
		// 1インターバルごとに変化する量
		var v = [];
		// 現在のスタイルを$elemの最初の要素から取得し、それを基準にアニメーションする
		$elem.each(function(i) {
			var prop = props[i];
			v[i] = {};
			curProps[i] = {};
			var curStyle = getComputedStyleObject($elem[i]);
			for ( var p in prop) {
				curProps[i][p] = parseFloat(curStyle[p]);
				v[i][p] = (parseFloat(prop[p]) - parseFloat(curStyle[p])) * interval / time;
			}
		});
		function fn() {
			count += interval;
			if (count > time) {
				// アニメーション終了
				clearInterval(timerId);
				// スタイルを削除して、デフォルト(cssなどで指定されている値)に戻す
				$elem.each(function(i) {
					for ( var p in props[i]) {
						this.style[p] = '';
					}
				});
				callback();
				return;
			}
			$elem.each(function(i) {
				var curProp = curProps[i];
				for ( var p in curProp) {
					curProp[p] += v[i][p];
				}
				$(this).css(curProp);
			});
		}
		fn();
		var timerId = setInterval(fn, interval);
	}

	/**
	 * opacityを0から、現在の要素のopacityの値までアニメーションします
	 *
	 * @param {jQuery} $elem fadeInさせる要素
	 * @param {Number} time アニメーションに掛ける時間(ms)
	 * @param {Function} callback アニメーションが終了した時に呼び出すコールバック関数
	 */
	function fadeIn($elem, time, callback) {
		// 現在のopacityを取得
		var opacities = [];
		$elem.each(function() {
			var opacity = parseFloat(getComputedStyleValue(this, 'opacity'));
			opacities.push({
				opacity: opacity
			});
		});
		// opacityを0にして、display:blockにする
		$elem.css({
			opacity: 0,
			display: 'block'
		});
		animate(opacities, $elem, time, callback);
	}

	/**
	 * opacityを現在の値から、0までアニメーションします
	 *
	 * @param {jQuery} $elem fadeOutさせる要素
	 * @param {Number} time アニメーションに掛ける時間(ms)
	 * @param {Function} callback アニメーションが終了した時に呼び出すコールバック関数
	 */
	function fadeOut($elem, time, callback) {
		var opacities = [];
		$elem.each(function() {
			opacities.push({
				opacity: 0
			});
		});
		animate(opacities, $elem, time, callback);
	}

	// =========================================================================
	//
	// Body
	//
	// =========================================================================

	windowHeight = windowSize('Height');
	documentHeight = documentSize('Height');
	documentWidth = documentSize('Width');
	scrollTop = scrollPosition('Top');
	scrollLeft = scrollPosition('Left');

	/**
	 * ブロッカー(画面ブロック)の表示や非表示を行うクラス。
	 * <p>
	 * このクラスは自分でnewすることはありません。{@link h5.ui.blocker}の戻り値がBlockerクラスです。
	 * </p>
	 *
	 * @class
	 * @name Blocker
	 * @see h5.ui.blocker
	 */
	/**
	 * @private
	 * @param {String|Object} target ブロッカーを表示する対象のDOM要素、jQueryオブジェクトまたはセレクタ
	 * @param {Object} [option] オプション
	 * @param {Number} [option.delay] 指定した時間(ms)後に表示する。デフォルトは即表示
	 * @param {boolean} [option.overlay] オーバレイ要素を表示するかどうか。デフォルトは表示する
	 * @param {Number} [option.fadeIn] ブロッカーをフェードで表示する場合、表示までの時間をミリ秒(ms)で指定する (デフォルト:フェードしない)
	 * @param {Number} [option.fadeOut] ブロッカーをフェードで非表示にする場合、非表示までの時間をミリ秒(ms)で指定する (デフォルト:しない)
	 * @param {jQuery|DOM} [option.contents] ブロッカーの上に表示するコンテンツ要素
	 * @param {Promise|Promise[]} [option.promises] Promiseオブジェクト (Promiseの状態に合わせて自動でブロッカーの非表示を行う)
	 * @param {String} [option.theme] テーマクラス名 (ブロッカーのにスタイル定義の基点となるクラス名 (デフォルト:'a')
	 */
	function Blocker(target, option) {
		var that = this;
		var $t = $(target);
		// ターゲットは1つのみ指定可能
		if ($t.length !== 1) {
			// TODO エラー
			return;
		}
		// スクリーンロックで表示するか判定
		// (自分のwindowのみで、ポップアップウィンドウの場合はスクリーンロックと判定しない)
		var isScreenlock = isScreenlockTarget($t);
		// スクリーンロックで表示する場合はターゲットはbodyにする
		$t = isScreenlock ? $('body') : $t;
		// documentの取得
		var doc = getDocumentOf($t[0]);

		// 別ウィンドウのwindow又はdocumentが指定されていた場合は、そのwindow,documentのbodyに出す
		if (doc !== window.document && ($t[0] === doc || getWindowOfDocument(doc) === $t[0])) {
			$t = $(doc.body);
		}

		// デフォルトオプション
		var defaultOption = {
			fadeIn: -1,
			fadeOut: -1,
			promises: null,
			block: true,
			theme: 'a'
		};
		// デフォルトオプションとユーザオプションをマージしたオプション情報
		var settings = $.extend(true, {}, defaultOption, option);

		// オプション情報
		this._settings = settings;
		// ブロッカーを画面に表示したか
		this._displayed = false;
		// スクリーンロックで表示するか
		this._isScreenLock = isScreenlock;
		// 表示対象であるDOM要素を保持するjQueryオブジェクト
		this._$target = $t;
		// 表示対象のDOM要素があるdocument
		this._document = doc;
		// 表示対象のDOM要素があるwindow
		this._window = getWindowOfDocument(doc);
		// scroll/touchmoveイベントハンドラで使用するタイマーID
		this._scrollEventTimerId = null;
		// scroll/touchmoveイベントハンドラ
		this._scrollHandler = function() {
			that._handleScrollEvent();
		};
		// resize/orientationchangeイベントハンドラ内で使用するタイマーID
		this._resizeEventTimerId = null;
		// scroll/touchmoveイベントハンドラ
		this._resizeHandler = function() {
			that._handleResizeEvent();
		};
		// DOM要素の書き換え可能かを判定するフラグ
		this._redrawable = true;
		// フェードインの時間 (フェードインで表示しない場合は-1)
		this._fadeInTime = typeof settings.fadeIn === 'number' ? settings.fadeIn : -1;
		// フェードアウトの時間 (フェードアウトで表示しない場合は-1)
		this._fadeOutTime = typeof settings.fadeOut === 'number' ? settings.fadeOut : -1;
		// コンテンツ
		this._$content = $();
		this.setContents(settings.contents);
		// ブロッカー(オーバレイ)
		this._$overlay = $();
		// スキン - IE6の場合selectタグがz-indexを無視するため、オーバーレイと同一階層にiframe要素を生成してselectタグを操作出来ないようにする
		// http://www.programming-magic.com/20071107222415/
		this._$skin = $();
		// httpsでiframeを開くと警告が出るためsrcに指定する値を変える
		// http://www.ninxit.com/blog/2008/04/07/ie6-https-iframe/
		var srcVal = 'https' === this._document.location.protocol ? 'return:false' : 'about:blank';

		for (var i = 0, len = this._$target.length; i < len; i++) {
			this._$overlay = this._$overlay
					.add((settings.block ? $(doc.createElement('div')) : $()).addClass(
							CLASS_INDICATOR_ROOT).addClass(settings.theme).addClass(CLASS_OVERLAY)
							.css('display', 'none'));
			this._$skin = this._$skin.add(((isLegacyIE || compatMode) ? $(doc
					.createElement('iframe')) : $()).attr('src', srcVal).addClass(
					CLASS_INDICATOR_ROOT).addClass(CLASS_SKIN).css('display', 'none'));
		}

		var position = this._isScreenLock && usePositionFixed ? 'fixed' : 'absolute';
		// オーバーレイ・コンテンツにpositionを設定する
		this._$overlay.css('position', position);

		var promises = settings.promises;
		var promiseCallback = function() {
			that.hide();
		};

		// jQuery1.7以下ならpipe、1.8以降ならthenを使ってコールバックを登録
		var pipeMethod = $.hasOwnProperty('curCSS') ? 'pipe' : 'then';
		if (isArray(promises)) {
			// プロミスでないものを除去
			promises = $.map(promises, function(item, idx) {
				return item && isFunction(item.promise) ? item : null;
			});

			if (promises.length > 0) {
				// whenを呼んで、pipeにコールバックを登録。
				// CFHの発火を阻害しないようにSilentlyでpipeコールバックを登録する。
				registerCallbacksSilently(h5.async.when(promises), pipeMethod, [promiseCallback,
						promiseCallback]);
			}
		} else if (promises && isFunction(promises.promise)) {
			// CFHの発火を阻害しないようにpipeを呼び出し。
			registerCallbacksSilently(promises, pipeMethod, [promiseCallback, promiseCallback]);
		}
	}
	Blocker.prototype = {
		/**
		 * 画面上にブロッカー(画面ブロック)を表示します。
		 *
		 * @memberOf Blocker
		 * @function
		 * @returns {Blocker} ブロッカーオブジェクト
		 */
		show: function() {
			if (this._displayed || !this._$target
					|| this._$target.children('.' + CLASS_INDICATOR_ROOT).length > 0) {
				return this;
			}

			this._displayed = true;

			var $target = this._$target;
			var $skin = this._$skin;
			var $overlay = this._$overlay;
			var $content = this._$content;
			var $window = $(this._window);

			var that = this;
			var fadeInTime = this._fadeInTime;
			var cb = function() {
				disableEventOnBlocker(that._$overlay);
				// 画面の向きの変更を検知したらインジータを中央に表示させる
				var $window = $(window);
				$window.bind('orientationchange', that._resizeHandler);
				$window.bind('resize', that._resizeHandler);
			};

			// position:absoluteの子要素を親要素からの相対位置で表示するため、親要素がposition:staticの場合はrelativeに変更する(親要素がbody(スクリーンロック)の場合は変更しない)
			// また、IEのレイアウトバグを回避するためzoom:1を設定する
			var targetPosition = getComputedStyleValue($target[0], 'position');
			if (!this._isScreenLock && targetPosition === 'static') {
				// ターゲットのposition/zoomを記憶させておく
				this._targetPosition = targetPosition;
				this._zoom = getComputedStyleValue($target[0], 'zoom');

				$target.css({
					position: 'relative',
					zoom: '1'
				});
			}
			$target.append($skin).append($overlay);

			// Array.prototype.pushを使って、適用する要素を配列にまとめる
			var elems = this._$skin.toArray();
			Array.prototype.push.apply(elems, this._$content.toArray());
			Array.prototype.push.apply(elems, this._$overlay.toArray());
			var $elems = $(elems);

			if (fadeInTime < 0) {
				$elems.css('display', 'block');
				cb();
			} else {
				fadeIn($elems, fadeInTime, cb);
			}

			this._reposition();
			this._resizeOverlay();

			// ターゲット及びターゲット内の要素にフォーカスが当たっているなら外す
			var doc = this._document;
			if ($target[0] === doc.activeElement || $target.find(doc.activeElement).length) {
				doc.activeElement.blur();
			}
			// ターゲット及びターゲット内の要素のフォーカスが当たらないよう設定
			this._controllFocusHandler = this._createControllFocusHandler($target, $content);
			$window.bind('keydown', this._controllFocusHandler);

			return this;
		},

		/**
		 * 画面上に表示されているブロッカー(メッセージ・画面ブロック・進捗表示)を除去します。
		 *
		 * @memberOf Blocker
		 * @function
		 * @returns {Blocker} ブロッカーオブジェクト
		 */
		hide: function() {
			if (!this._displayed) {
				return this;
			}

			this._displayed = false;

			var that = this;
			var fadeOutTime = this._fadeOutTime;
			// Array.prototype.pushを使って、適用する要素を配列にまとめる
			var $overlay = this._$overlay;
			var $skin = this._$skin;
			var $elems = $overlay.add($skin);
			var $window = $(this._window);
			var cb = function() {
				$elems.remove();
				// 親要素のposition/zoomをブロッカー表示前の状態に戻す
				if (!that._isScreenLock) {
					that._$target.each(function(i, e) {
						var $e = $(e);
						$e.css({
							position: this._position,
							zoom: this._zoom
						});
					});
				}

				$window.unbind('touchmove', that._scrollHandler);
				$window.unbind('scroll', that._scrollHandler);
				$window.unbind('orientationchange', that._resizeHandler);
				$window.unbind('resize', that._resizeHandler);
				$window.unbind('keydown', that._controllFocusHandler);

				if (that._resizeEventTimerId) {
					clearTimeout(that._resizeEventTimerId);
				}
				if (that._scrollEventTimerId) {
					clearTimeout(that._scrollEventTimerId);
				}
			};

			if (fadeOutTime < 0) {
				$elems.css('display', 'none');
				cb();
			} else {
				fadeOut($elems, fadeOutTime, cb);
			}

			return this;
		},

		/**
		 * コンテンツの設定
		 * <p>
		 * ブロッカーの上に表示するコンテンツ要素を設定します。コンテンツ要素も同様にブロッカーのshow/hideのタイミングで表示/非表示が切り替わります。
		 * </p>
		 *
		 * @memberOf Blocker
		 * @param {DOM|jQuery|stirng}
		 */
		setContents: function(contents) {
		// TODO
		},

		/**
		 * オーバーレイのサイズを再計算します。
		 * <p>
		 * position:fixedで表示している場合は再計算しません。また、オーバレイ非表示の場合は何もしません。
		 * <p>
		 * position:absoluteの場合は高さのみ再計算を行い、IE6以下の標準モード及びQuirksモードの場合は高さと幅の両方を再計算します。
		 *
		 * @memberOf Blocker
		 * @function
		 * @private
		 */
		_resizeOverlay: function() {
			// スクリーンロックでpoisition:fixedが使用可能なブラウザの場合は、オーバレイをposition:fixedで表示している
			// オーバレイをposition:fixedで表示している場合は何もしない
			// また、オーバレイを表示していない(block:false)ブロッカーなら何もしない
			if ((this._isScreenLock && usePositionFixed) || this._$overlay.length === 0) {
				return;
			}

			var $overlay = this._$overlay;
			var $target = this._$target;
			var $skin = this._$skin;

			var w, h;

			//オーバーレイはターゲット要素全体の大きさ(スクロールサイズ)にする
			if (this._isScreenLock) {
				w = documentWidth();
				h = documentHeight();
			} else {
				// オーバレイとコンテンツを非表示にしたときのscrollWidth/Heightを取得する
				$overlay.css('display', 'none');
				var scrSize = getScrollSize($target[0]);
				$overlay.css('display', 'block');
				w = scrSize.w;
				h = scrSize.h;
			}
			$overlay[0].style.width = w + 'px';
			$overlay[0].style.height = h + 'px';

			if (isLegacyIE || compatMode) {
				$skin[0].style.width = w + 'px';
				$skin[0].style.height = h + 'px';
			}
		},

		/**
		 * ブロッカーのメッセージ要素のwidthを調整し、中央になるようtopとleftの位置を設定します。
		 *
		 * @memberOf Blocker
		 * @function
		 * @private
		 */
		_reposition: function() {
			var $target = this._$target;
			var $content = this._$content;
			if (!$content.length) {
				return;
			}

			// ------------ コンテンツの位置再計算 ------------ //
			if (this._isScreenLock) {
				// MobileSafari(iOS4)だと $(window).height()≠window.innerHeightなので、window.innerHeightをから高さを取得する
				// また、quirksモードでjQuery1.8.xの$(window).height()を実行すると0を返すので、clientHeightから高さを取得する
				var wh = windowHeight();

				if (usePositionFixed) {
					// 可視領域からtopを計算する
					$content.css('top', ((wh - getOuterHeight($content[0])) / 2) + 'px');
				} else {
					// 可視領域+スクロール領域からtopを計算する
					$content.css('top',
							((scrollTop() + (wh / 2)) - (getOuterHeight($content[0]) / 2)) + 'px');
				}
			} else {
				//オーバーレイの計算はスクロールサイズを基準にしている。これに倣い、中央揃え計算の基準はinnerHeight()にする(＝paddingを含める)。leftも同様
				$content.css('top', $target.scrollTop()
						+ (getInnerHeight($target[0]) - getOuterHeight($content[0])) / 2);
			}

			var blockElementPadding = getInnerWidth($content[0]) - getWidth($content[0]);

			var totalWidth = 0;

			$content.children().each(function() {
				var $e = $(this);
				// IE9にて不可視要素に対してouterWidth(true)を実行すると不正な値が返ってくるため、display:noneの場合は値を取得しない
				if (getComputedStyleValue($e[0], 'display') === 'none') {
					return true;
				}
				totalWidth += getOuterWidth(this, true);
			});
			$content.css('width', totalWidth + blockElementPadding);
			$content.css('left', $target.scrollLeft()
					+ (getInnerWidth($target[0]) - getOuterWidth($content[0])) / 2);
		},

		/**
		 * scroll/touchmoveイベントハンドラ
		 * <p>
		 * タッチまたはホイールスクロールの停止を検知します
		 */
		_handleScrollEvent: function() {
			if (this._scrollEventTimerId) {
				clearTimeout(this._scrollEventTimerId);
			}

			if (!this._redrawable) {
				return;
			}

			var that = this;
			this._scrollEventTimerId = setTimeout(function() {
				that._reposition();
				that._scrollEventTimerId = null;
			}, 50);
		},
		/**
		 * orientationChange/resizeイベントハンドラ
		 * <p>
		 * orientationChange/resizeイベントが発生した1秒後に、ブロッカーとオーバーレイを画面サイズに合わせて再描画し、 コンテンツの位置を再計算する
		 *
		 * @memberOf Blocker
		 * @function
		 * @private
		 */
		_handleResizeEvent: function() {
			var that = this;

			function updateMessageArea() {
				that._resizeOverlay();
				that._reposition();
				that._redrawable = true;
				that._resizeEventTimerId = null;
			}

			if (this._resizeEventTimerId) {
				clearTimeout(this._resizeEventTimerId);
			}

			this._redrawable = false;

			if (usePositionFixed || isLegacyIE || compatMode) {
				updateMessageArea();
			} else {
				// Android 4.xの場合、orientationChangeイベント発生直後にDOM要素の書き換えを行うと画面の再描画が起こらなくなることがあるため、対症療法的に対処
				this._resizeEventTimerId = setTimeout(function() {
					updateMessageArea();
				}, 1000);
			}
		},

		/**
		 * フォーカス制御
		 *
		 * @private
		 * @memberOf Blocker
		 */
		_createControllFocusHandler: function($target, $content) {
			var doc = getDocumentOf($target[0]);
			return function(e) {
				// tabキー
				if (e.keyCode !== 9) {
					return;
				}
				// preventDefaultして、フォーカス遷移を制御する
				e.preventDefault();
				// tabでフォーカスを当てられる要素を列挙
				var $focusable = $(doc.body).find('*').filter(
						function(i, element) {
							// tabIndexが-1でない要素のうち、
							// $target内の要素はフォーカスを当てられない
							// ただし、$target内でも$content内であればフォーカスを当てられる
							var $element = $(element);
							return element.tabIndex !== -1
									&& (!$element.closest($target).length || $element
											.closest($content).length);
						});
				$focusable.sort(function(a, b) {
					var aIndex = a.tabIndex;
					var bIndex = b.tabIndex;
					return aIndex - bIndex;
				});
				var index = $focusable.index(doc.activeElement);
				var next = $focusable[index + 1] || $focusable[0];
				$(next).focus();
			};
		}
	};

	/**
	 * 指定された要素に対して、ブロッカー(画面ブロック)の表示や非表示を行うためのオブジェクトを取得します。
	 * <p>
	 * 第1引数にブロッカーの設定を記述したパラメータオブジェクトを指定してください。
	 * <p>
	 * <strong>第1引数にブロッカーのターゲットを指定する方法は非推奨です。</strong>
	 * </p>
	 *
	 * <pre><code>
	 * h5.ui.blocker({
	 * 	target: 'body'
	 * });
	 *
	 * // h5.ui.blocker('body'); 非推奨
	 * </code></pre>
	 *
	 * targetに<strong>document</strong>、<strong>window</strong>または<strong>body</strong>を指定しかつ、blockオプションがtrueの場合、「スクリーンロック」として動作します。<br>
	 * 上記以外のDOM要素を指定した場合は、指定した要素上にブロッカーを表示します。
	 * <p>
	 * <strong>スクリーンロック</strong>とは、コンテンツ領域(スクロールしないと見えない領域も全て含めた領域)全体にオーバーレイを、表示領域(画面に見えている領域)中央にメッセージが表示し、画面を操作できないようにすることです。スマートフォン等タッチ操作に対応する端末の場合、スクロール操作も禁止します。
	 * <h4>スクリーンロック中の制限事項</h4>
	 * <ul>
	 * <li>Android
	 * 4.xにてorientationchangeイベント発生直後にブロッカーのDOM要素の書き換えを行うと画面の再描画が起こらなくなってしまうため、orientationchangeイベント発生から1秒間percent()/massage()での画面の書き換えをブロックします。<br>
	 * orientationchagenイベント発生から1秒以内にpercent()/message()で値を設定した場合、最後に設定された値が画面に反映されます。</li>
	 * <li>WindowsPhone 7ではscrollイベントを抑止できないため、ブロッカー背後の要素がスクロールしてしまいます。ただし、クリック等その他のイベントはキャンセルされます。</li>
	 * </ul>
	 * <h4>使用例</h4>
	 * <strong>スクリーンロックとして表示する</strong><br>
	 *
	 * <pre>
	 * var blocker = h5.ui.blocker({
	 * 	target: document
	 * }).show();
	 * </pre>
	 *
	 * <strong>パラメータにPromiseオブジェクトを指定して、done()/fail()の実行と同時にブロッカーを除去する</strong><br>
	 * resolve() または reject() が実行されると、画面からブロッカーを除去します。
	 *
	 * <pre>
	 * var df = $.Deferred();
	 * var blocker = h5.ui.blocker({
	 * 	target: document,
	 * 	promises: df.promise()
	 * }).show();
	 *
	 * setTimeout(function() {
	 * 	df.resolve(); // ここでブロッカーが除去される
	 * }, 2000);
	 * </pre>
	 *
	 * <strong>パラメータに複数のPromiseオブジェクトを指定して、done()/fail()の実行と同時にブロッカーを除去する</strong><br>
	 * Promiseオブジェクトを複数指定すると、全てのPromiseオブジェクトでresolve()が実行されるか、またはいずれかのPromiseオブジェクトでfail()が実行されるタイミングでブロッカーを画面から除去します。
	 *
	 * <pre>
	 * var df = $.Deferred();
	 * var df2 = $.Deferred();
	 * var blocker = h5.ui.blocker({
	 * 	target: document,
	 * 	promises: [df.promise(), df2.promise()]
	 * }).show();
	 *
	 * setTimeout(function() {
	 * 	df.resolve();
	 * }, 2000);
	 *
	 * setTimeout(function() {
	 * 	df.resolve(); // ここでブロッカーが除去される
	 * }, 4000);
	 * </pre>
	 *
	 * @memberOf h5.ui
	 * @name blocker
	 * @function
	 * @param {Object} param パラメータオブジェクト
	 * @param {DOM|jQuery|String} param.target ブロッカーを表示する対象のDOM要素、jQueryオブジェクトまたはセレクタ
	 * @param {Number} [param.fadeIn] ブロッカーをフェードで表示する場合、表示までの時間をミリ秒(ms)で指定する (デフォルト:フェードしない)
	 * @param {Number} [param.fadeOut] ブロッカーをフェードで非表示にする場合、非表示までの時間をミリ秒(ms)で指定する (デフォルト:しない)
	 * @param {Promise|Promise[]} [param.promises] Promiseオブジェクト (Promiseの状態に合わせて自動でブロッカーの非表示を行う)
	 * @param {String} [param.theme] テーマクラス名 (ブロッカーのにスタイル定義の基点となるクラス名 (デフォルト:'a')
	 * @param {Object} [option] 第1引数にターゲット(param.target)を指定して、第2引数にオプションオブジェクトを指定できます。<strong>ただしこの指定方法は非推奨です。</strong><br>
	 *            第2引数のオプションオブジェクトの構造は、パラメータオブジェクトと同様です。
	 * @returns {Blocker}
	 */
	function blocker(param, option) {
		if ($.isPlainObject(param)) {
			// 第1引数にパラメータオブジェクトが渡されていた場合は、ターゲットをパラメータオブジェクトから取得
			// (第1引数がプレーンオブジェクトならパラメータ、そうでないならターゲットの指定と判定する)
			return new Blocker(param.target, param);
		}
		// 第1引数にターゲット、第2引数にオプションオブジェクト
		return new Blocker(param, option);
	}
	;

	// =============================
	// Expose to window
	// =============================

	/**
	 * @namespace h5.ui
	 */
	h5.u.obj.expose('h5.ui', {
		blocker: blocker
	});
})();
