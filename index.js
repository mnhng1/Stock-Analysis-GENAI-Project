import { dates } from '/utils/dates'
import OpenAI from 'openai'
import { config } from 'dotenv';

const tickersArr = []

const generateReportBtn = document.querySelector('.generate-report-btn')

generateReportBtn.addEventListener('click', fetchStockData)

document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length > 2) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        tickersArr.push(newTickerStr.toUpperCase())
        tickerInput.value = ''
        renderTickers()
    } else {
        const label = document.getElementsByTagName('label')[0]
        label.style.color = 'red'
        label.textContent = 'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.'
    }
})

function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = '' 
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchStockData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            const url = `https://polygon-api-worker.minhnguyentuong1.workers.dev/`
            const headers = {
                method : 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'ticker': ticker,
                    'startDate': dates.startDate,
                    'endDate': dates.endDate

                })
            }
            const response = await fetch(url, headers)
            const data = await response.json()
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating report...'
                delete data.request_id
                return JSON.stringify(data)
            } else {
                loadingArea.innerText = 'There was an error fetching stock data.'
            }
        }))
        fetchReport(stockData.join(''))
    } catch(err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error('error: ', err)
    }
}
async function fetchReport(data) {
    
    const messages = [
        {
            role: 'system',
            content: 'You are a trading guru. Given data on share prices of the stock symbol and earning reports over the past 3 days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell of that input stock symbol'
        },
        {
            role: 'user',
            content: data
        }]

    try {

    
    const url = "https://open-ai-worker.minhnguyentuong1.workers.dev/"

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(messages)
    })

    if (!response.ok) {
        throw new Error(`Worker Error: ${response.error}` )
    }

    const data = await response.json()
    renderReport(data.content)
} catch (err) {
    console.error(err.message)
    loadingArea.innerText = 'Unable to access AI. Please refresh and try again'
}
    /** 
     * Challenge:
     * 1. Use the OpenAI API to generate a report advising 
     * on whether to buy or sell the shares based on the data 
     * that comes in as a parameter.
     * 
     * 🎁 See hint.md for help!
     * 
     * 🏆 Bonus points: use a try catch to handle errors.
     * **/
}
function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}