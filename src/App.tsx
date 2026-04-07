import React from 'react'
import {UrlParser} from './UrlParser.tsx'

const App: React.FC = () => {
    return (
        <section className='container'>
            <h1>Recipe browser</h1>   
            <UrlParser />
        </section>
    )
}

export default App