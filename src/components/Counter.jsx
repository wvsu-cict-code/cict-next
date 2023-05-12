import React from 'react'

export default function Counter(){
    const [counter, setCounter] = React.useState(0)
    return (
        <div>
            {counter}
            <button onClick={()=>setCounter(counter+1)}>add</button>
        </div>
    )
}