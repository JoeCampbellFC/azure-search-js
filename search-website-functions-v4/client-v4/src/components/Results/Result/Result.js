import React from 'react';

import './Result.css';

export default function Result(props) {
    
    console.log(`result prop = ${JSON.stringify(props)}`)
    
    return(
    <div className="card result">
        <a href={`/details/${props.document.id}`}>            
            <div className="card-body">
                <h6 className="title-style">{props.document.sourcefile}</h6>
            </div>
        </a>
    </div>
    );
}
