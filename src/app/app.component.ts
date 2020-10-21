import { HistoricValue } from './core/historic-value.model'
import { Currency } from './core/currency.model'
import { Component, OnInit } from '@angular/core'
import { MatSlideToggleChange } from '@angular/material'
import { interval } from 'rxjs'
import * as _ from 'lodash'
import { formatCurrency } from '@angular/common'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  eurSymbole = '€'
  usdSymbole = '$'
  eurPlaceholder = 'Euro'
  usdPlaceholder = 'Dollar'
  tableMaxRows = 5
  appliedInterval = 3000

  historicValues: HistoricValue[] = []
  entredCurrency: Currency = {}
  convertedCurrency: Currency = {}
  conversionRate: number
  entredConversionRate: number
  defaultConversion = true
  fixConversionRate = false
  applyNewRate = false
  autoConversionRate = true

  ngOnInit(): void {
    this.setEurParametersAsEnteredValue()
    this.setUsdParametersAsConvertedValue()
    this.intializeValues()
    this.applyConversion()
  }

  applyConversion() {
    interval(this.appliedInterval)
      .subscribe(() => {
        this.conversionRate = this.getConversionRate()
        if (this.applyNewRate) {
          this.verifyDifferenceBetweenFixedAndRealRate()
        }
        this.convertCurrency()
      })
  }

  verifyDifferenceBetweenFixedAndRealRate() {
    if (Math.abs(this.entredConversionRate - this.conversionRate) > 0.02 * this.conversionRate) {
      this.applyNewRate = false
      this.autoConversionRate = true
    } else {
      this.autoConversionRate = false
    }
  }

  applyFixedRate() {
    (this.fixConversionRate) ? this.applyNewRate = true : this.applyNewRate = false
    this.verifyDifferenceBetweenFixedAndRealRate()
    this.convertCurrency()
    this.getConversionHistory()
  }

  updateFixedConvirsionRate() {
    this.autoConversionRate = false
    this.entredConversionRate = null
  }

  convertCurrency() {
    if ((!this.fixConversionRate && !this.applyNewRate) || !this.applyNewRate) {
      this.convertedCurrency.value = (this.entredCurrency.value * this.conversionRate).toFixed(2)
    }
    else {
      this.convertedCurrency.value = (this.entredCurrency.value * this.entredConversionRate).toFixed(2)
    }
  }

  updateConversion() {
    this.convertCurrency()
  }

  // Conversion history
  getConversionHistory() {
    if (this.defaultConversion) {
      this.historicValues.push({
        convertionRate: this.conversionRate,
        entredConvertionRate: this.entredConversionRate,
        entredCurrency: formatCurrency(this.entredCurrency.value, 'FR', '€', 'EUR'),
        convertedCurrency: formatCurrency(this.convertedCurrency.value, 'FR', '$', 'USD')
      })
    } else {
      this.historicValues.push({
        convertionRate: this.conversionRate,
        entredConvertionRate: this.entredConversionRate,
        entredCurrency: formatCurrency(this.entredCurrency.value, 'FR', '$', 'USD'),
        convertedCurrency: formatCurrency(this.convertedCurrency.value, 'FR', '€', 'Eur')
      })
    }
    if (this.historicValues.length > this.tableMaxRows) {
      this.historicValues = this.historicValues.slice(Math.max(this.historicValues.length - this.tableMaxRows, 0))
    }
  }

  // Initialization
  intializeValues() {
    this.conversionRate = 1.1
    this.entredCurrency.value = 1
    this.convertedCurrency.value = this.entredCurrency.value * this.conversionRate
  }

  //Calculate conversion rate
  getConversionRate() {
    const precision = 100
    let conversionRate = Math.floor(Math.random() * (1.15 * precision - 1.05 * precision) + 1.05 * precision) / precision
    this.defaultConversion ? conversionRate = conversionRate : conversionRate = 1 / conversionRate
    return conversionRate
  }

  // Converter
  onConverterChange(event: MatSlideToggleChange) {
    if (event.checked) {
      this.defaultConversion = true
      this.setEurParametersAsEnteredValue()
      this.setUsdParametersAsConvertedValue()
    } else {
      this.conversionRate = 1 / this.conversionRate
      this.defaultConversion = false
      this.setUsdParametersAsEntredValue()
      this.setEurParametersAsConvertedValue()
    }
    this.getConversionRate()
    this.convertCurrency()
  }

  setEurParametersAsEnteredValue() {
    this.entredCurrency.symbole = this.eurSymbole
    this.entredCurrency.placeholder = this.eurPlaceholder
  }

  setUsdParametersAsConvertedValue() {
    this.convertedCurrency.symbole = this.usdSymbole
    this.convertedCurrency.placeholder = this.usdPlaceholder
  }

  setUsdParametersAsEntredValue() {
    this.entredCurrency.symbole = this.usdSymbole
    this.entredCurrency.placeholder = this.usdPlaceholder
  }

  setEurParametersAsConvertedValue() {
    this.convertedCurrency.symbole = this.eurSymbole
    this.convertedCurrency.placeholder = this.eurPlaceholder
  }
}
