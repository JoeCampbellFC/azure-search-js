import React from 'react';

import './Answer.css';

export default function Result(props) {
    
    console.log(`answer prop = ${JSON.stringify(props)}`)
 
    // Create an object with a __html property to use with dangerouslySetInnerHTML
    const createMarkup = (htmlContent) => {
        return { __html: htmlContent };
    };

    return(
    <div className="">

            <div className="answer">
              
                <span dangerouslySetInnerHTML={createMarkup(props.answer)}></span>
                         
            </div>
        
    </div>
    );
}
