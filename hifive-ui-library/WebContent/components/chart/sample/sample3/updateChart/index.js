/*
 * Copyright (C) 2012-2014 NS Solutions Corporation
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
(function() {

	var DUMMY_DATA_SIZE = 10;

	var dataSourceManager = h5.ui.components.chart.dataSourceManager;

	/**
	 * @class
	 * @memberOF ui.sample.chart
	 */
	var pageController = {
		/**
		 * @memberOf ui.sample.chart.pageController
		 */
		__name: 'ui.sample.chart.pageController',

		_chartController: h5.ui.components.chart.ChartController, // チャートライブラリ

		__meta: {
			_chartController: {
				rootElement: '#chart'
			}
		},

		__ready: function(context) {
			// 取得したデータをもとにチャートを表示
			var name = 'bar_series';

			this._dataSource = dataSourceManager.createDataSource({
				name: name,
				// ダミーデータを生成
				data: ui.sample.chart.createChartDummyData(DUMMY_DATA_SIZE, 400, 100)
			// ダミーデータを生成
			});

			this._chartController.draw({
				chartSetting: {
					width: 600,
					height: 480
				},
				plotSetting: {
					paddingRight: 0.25
				},
				axes: { // 軸の設定
					xaxis: { // x軸	
						lineNum: DUMMY_DATA_SIZE - 2
					},
					yaxis: { // y軸
						lineNum: 5, // y軸の補助線の数(上部は含む)
						paddingRight: 0,
						autoScale: function(min, max) { // オートスケールの定義
							return {
								rangeMax: Math.ceil(max / 500) * 500,
								rangeMin: 0
							};
						},
						range: { //Y軸の表示領域
							min: 0,
							max: 500
						}
					}
				},
				seriesDefault: { // すべての系列のデフォルト設定
					// 表示データ数
					mouseover: {
						tooltip: {
							content: this.own(this._getTooltipContent)
						}
					}
				},
				series: [{
					name: name, //系列名(キーとして使用する)
					type: 'bar',
					data: this._dataSource, // データ
					propNames: { // チャートに表示するときに使用するプロパティ名
						y: 'val'
					},
					color: ui.sample.chart.getRandomColor()
				}]
			// 系列データ
			});
		},

		/**
		 * 系列追加ボタンを押下すると、系列を追加する
		 */
		'#update click': function() {
			dataSourceManager.beginUpdate();
			this._dataSource.removeAll();
			this._dataSource
					.addAll(ui.sample.chart.createChartDummyData(DUMMY_DATA_SIZE, 400, 100));
			dataSourceManager.endUpdate();
		},

		_getTooltipContent: function(data) {
			return data.label + ':' + data.val.toString();
		}
	};

	h5.core.expose(pageController);
})();

$(function() {
	h5.core.controller('body', ui.sample.chart.pageController);
});