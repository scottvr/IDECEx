# IDECEx
Interactive Drake Equation Calculator/Explorer

The most current dev branch can be played with in action at [killsignal.net/IDECEx](https://www.killsignal.net/IDECEx/web/)
______________
… inspired by a conversation I was having with someone about recognizing an “alien” intelligence in which he brought up the Drake Equation and gave some value for N based on some common “WAG” (wild-ass guess) values for the other variables and showed me an online Drake Equation Calculator, then commenting: “what I’d like to do is be able to give it [the calculator] the number of civilizations (N), and see what probabilities you’d need to …”

The immediate implementation that came to mind would be to just allow the user of the calculator to edit any value in the currently displayed Drake Equation (its html form field), and then adjust the other values with algebraic rearranging of terms so that the equation is, well, equal on both sides.

But, since the initial values are hopefully sane, but admittedly “WAG” numbers, what new values would be appropriate for the variables not in focus? Random WAGs? Increments/decrements based on some rules? Update all of the variable values when calculating? How would the person who expressed the desire for a more flexible Drake Equation Calculator want to explore this?

I started putting some ideas into a text document and threw a small initial barebones calculator up on a webserver. I'm putting it here just to try to be more disciplined and less sloppy with  personal projects. 

______
>Pasting my informal "requirements doc" and other ramblings pertaining to The IDECEx below. I'm not a software engineering manager nor product or project manager, and I don't have a team of frontend devs who will read this and deliver the goods. It's for me to try to focus on deliverables, avoiding scope-creep and resist the ADHD-propensity to shiner things. For more esoteric stuff like what libraries might be well-suited for the visualizations, I may add ChatGPT or Claude (or whatever LLM) to the team, but in any case this is a work in progress, not a released product. 

______
## <ins>The Equation</ins> (Calculation)

**The Drake Equation is typically written as:**

$$
N = R_* \times f_p \times n_e \times f_l \times f_i \times f_c \times L
$$


where:

$N =$ number of civilizations with which humans could communicate

$R_* =$ average rate of star formation in our galaxy

$f_p =$ fraction of those stars that have planetary systems

$n_e =$ average number of planets that could potentially support life per star with planets

$f_l =$ fraction of planets that could support life where life actually appears

$f_i =$ fraction of planets with life where intelligent life evolves

$f_c =$ fraction of civilizations that develop a technology that releases detectable signs of their existence into space

$L =$  length of time such civilizations release detectable signals into spaceship


**Focusing on other variables**

Mathematically, it is trivial to rewrite the equation to solve for any individual variable.  For example: 

$$
R_* = \frac{N}{f_p \times n_e \times f_l \times f_i \times f_c \times L}
$$

Similarly, any other variable can be isolated by rearranging the equation accordingly.


## <ins>UI/UX</ins> (Exploration)

### User Interactivity
- Interactive Inputs: Each variable should have an input field that allows users to enter or adjust values. To solve for a specific variable, users can leave that field blank or mark it as the one to be calculated.

- Locking Values: A checkbox next to each input field can be used to "lock" a value. When a value is locked, it remains constant, and other variables are adjusted around it.

- Real-time Calculation: As users adjust values or lock/unlock variables, real-time calculations update the remaining variables. JavaScript can handle this dynamically.

### Constraints and Controls
- Min/Max Values: Define reasonable ranges for each variable based on scientific knowledge or user preferences.
- Increment/Decrement Arrows: Allow users to fine-tune values easily.
- Integer-only Constraint: Depending on the context, some variables might make sense as integers (e.g., the number of planets).

______

## Implementation Strategy
### Initial Form/Equation Setup: 
- Start with default WAG values for each variable and compute 

### User Interaction:
- If a user inputs a value for $N$, the system identifies it as the target variable to solve for.
- Based on which fields are locked and the target variable, the system rearranges the equation and computes the necessary value.

### Dynamic Feedback: 
- Use real-time updates to show the impact of changes immediately. This helps users understand the relationships between variables better.

## Example Workflow
1. Default State: 

  All variables have initial WAG values, and 
$N$ is calculated.

2. User Inputs $N$:

  The user inputs a specific value for $N$.

3. Recalculate: 

  The system identifies $N$ as the dependent variable, locks it, and recalculates the appropriate variable based on which fields are editable and which are locked.

4. Interactive Adjustment: 

  The user can lock/unlock other variables and see real-time updates as they make adjustments.

## Example UI Flow
***can be a single page with a landing section at top, main equation interface section below, and the vast space below that for visualizations.***
1. Landing: 
 - Briefly introduce the Drake Equation, its purpose, and the interface.
2. Main Interface:
 - Input Fields/Sliders: 
   - For each variable, with tooltips and initial values.
 - Solve For: 
    - Dropdown(??) to select the variable to solve for.
 - Lock/Unlock Checkboxes: 
    - Next to each variable input.
 - (opt'l/later) Scenario Presets: 
    - Buttons to load preset scenarios.
 - Advanced Options: 
    - Tab or section for custom ranges and probability distributions.
3. Results Section: 
 - Show calculated values, graphs, and possibly a summary of the implications.
 - Graphs/Charts: 
    - Displaying the results dynamically.
    - Perhaps a visual representation of planets, their sizes and distances, with labels to help drive the point home. 
____

## Additional thoughts/guidance wrt UI/UX
### Intuitive Layout: 
- Arrange the variables in a logical and visually appealing way. 
- Consider grouping related variables together and using clear labels to indicate their meanings.

### Dynamic Visualization:
- Graphs and Charts: 
  - Display the relationships and impacts of variable changes using graphs. For instance, show how changing $f_p$ or $L$ affects $N$.
- Interactive Sliders: 
  - Use sliders for variables, allowing users to see real-time changes. 
  - Sliders can be paired with input fields for precise control.
- Tooltips and Explanations:
  - Include tooltips that explain each variable and its significance when hovered over.
  - Provide a brief summary of the Drake Equation and its purpose for new users.
- Preset Scenarios:
  - Initially might be useful to serve as documentation
  - Offer preset scenarios with predefined values for the variables. This helps users get started quickly and understand typical ranges.
  - (optionally/later) Allow users to save their own scenarios for later analysis.
- Advanced Options:
  - Custom Ranges: Let users set custom min/max ranges for each variable.
  - Probability Distributions: For more advanced users, include options to use probability distributions instead of single values to reflect uncertainty.
- Responsive Design: 
  - Ensure the interface works well on various devices, including desktops, tablets, and smartphones.

## Important Functionality Clarification
Reverse Calculation Feature:

The app should allow users to solve for any variable, not just $N$. 

> Should we implement a dropdown or toggle to select the target variable, rather than just using the field that caused the event that triggers recalculation?
No preference here; looking for feedback on what is easiest to implement and is thought will be most obvious to a user. 
When a variable is selected as the target, lock it and adjust the other variables accordingly.

## Desireable Features, but not required for MVP. If easily implemented, we should try for the MVP though. 
*Simulation Mode:*
- Enable users to run simulations that vary one or more variables within a specified range and visualize the results.
- Show a range of possible outcomes to highlight the impact of uncertainty.

*Collaborative Features:*
- Implement a feature for users to share their scenarios and results with others.
- Include a discussion or comment section where users can discuss their findings and hypotheses.

## Post-MVP Enhancements
*Educational Content:*
- Provide links to articles, videos, or other resources explaining the Drake Equation and its components in more detail.
- Include case studies or historical data related to the search for extraterrestrial life.
