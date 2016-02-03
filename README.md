# Ants vs. Some-Bees

This module is a simple turn-based tower-defense game played on the command-line, completed as part of a [course](http://arch-joelross.rhcloud.com/) at the UW ISchool. 

The below questions should be answered (in detail!) regarding your submission!


##### 1. Spend some time reading through the provided code _carefully_ to make sure you understand it. After you've read the code, in the space below list any _design patterns_ we discussed in class that you can find (note that you may need to revisit the code after each lecture). Be clear about which pattern is used, where, and _why it is being employed_.
> A composite pattern is being used for creating essentially the entire game, the complex composite is the Ant game, which creates a AntColony which creates Places that contain Insects. I also think that there is a factory pattern being used 


##### 2. After you've read the code, is there anywhere that it could be re-architected (e.g., using design patterns) to be more changeable or reusable? 
> I think it might be a bit re-architected in that Bee's aren't really at all related to Ants, and the composition of the two might be better separated out into attackers and defenders. Especially if you want to add new enemies in the future. They act pretty much completely different and I think it would make the code more readable if they didn't try and share a lot of methods.


##### 3. The tunnels in the `AntColony` are structured as a ___Linked List___ (where each element is a `Place`, and the `exit` and `entrance` variables are the traditional `next` and `prev`). Why is this data structure appropriate (as opposed to, say, an array). _You may need to revisit your notes from CSE 143._
> This data structure is approprate because when the Bees move, instead of looking up the array, finding it's place and then changing the index, it just has to find it's place and move to the exit of the place. This is also good because the ants can now be in the same place as the Bees for when they attack or in the case of the Ninja, pass by.


##### 4. Describe the overall architecture you used to implement the different components of this assignment. Did you use inheritance? A particular design pattern?
> I mostly used Strategy designs and a single factory to create the ants and dynamically assign strategies.

##### 5. Specifically, discuss your use of object-oriented design patterns in your program. What patterns did you use in your implementation (be specific)? Why? Is there anywhere you explicitly decided _not_ to use a pattern (e.g., because doing so would have made it more difficult to change the code later, etc)? Be detailed---you should reflect carefully on your own design and architecture work!
> First I created objects 


##### 6. Approximately how many hours did it take you to complete this assignment? #####
> I think I spent probably close to 20 hours on this assignment?


##### 7. Did you receive help from any other sources (classmates, etc)? If so, please list who (be specific!). #####
> I looked up how to implement Singletons using ES6 classes and found a solution on StackExchange


##### 8. Did you encounter any problems in this assignment we should warn students about in the future? How can we make the assignment better? #####
> I had a super hard time trying to implement a strategy for the container ant, for some reason it would not be able to find the ant and contain it. I don't think this was the fault of the assignment
