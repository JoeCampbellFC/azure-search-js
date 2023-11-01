import React from 'react';

import './Result.css';

export default function Result(props) {
    
    console.log(`result prop = ${JSON.stringify(props)}`)
 
    // Create an object with a __html property to use with dangerouslySetInnerHTML
    const createMarkup = (htmlContent) => {
        return { __html: htmlContent };
    };

    return(
    <div className="card result">
       
        <a href={`/details/${props.document.document.id}`}>            
            <div className="card-body">
                <h5 className="title-style">{props.document.document.title}</h5>
                <span className="ellipsis" dangerouslySetInnerHTML={createMarkup(props.document.highlights.content)}></span>
                <br/>
                <span>{props.document.document.category}</span>
            </div>
        </a>
    </div>
    );
}
