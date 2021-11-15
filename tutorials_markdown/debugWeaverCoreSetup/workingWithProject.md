# Using the Project

### Here is a quick rundown on what each part of the UI is for:

![Project Window Highlighted](https://user-images.githubusercontent.com/12601671/141735320-950864d7-a0e9-4fae-80a0-5024c74866c1.PNG)

## <span style="color:green">Project Panel</span>

This is where you can browse all of the imported assets. Stuff like sprites, audio files, text files, scene files, and many more files can be accessed here.

## <span style="color:red">Hierarchy Panel</span>

When you load up a scene, this is where you will see all the objects in the scene.

## <span style="color:blue">Scene View</span>

When you load up a scene, this window will visually show you where the objects are in the scene.

## <span style="color:#988f00">Inspector</span>

This is where you can see the properties of objects in the scene. If you select an object in the Hierarchy menu, properties of the objects can be viewed and modified in this section


# Opening the Sample Scene

In the Project Panel, click on the "Assets" folder to view it's contents, then double click on the SampleScene file. This will load up the Sample Scene so it can be viewed in both the Hierarchy and the Scene View. This will be the scene you can add and remove content to.

![Project View Open Project](https://user-images.githubusercontent.com/12601671/141735870-ff6f3ed5-52ad-47cd-952f-0d0b9602a92f.PNG)

![Project Scene Opened](https://user-images.githubusercontent.com/12601671/141833457-1e79e642-426b-4479-8b70-9c20c1c7d9e1.PNG)

### Watch this video for a basic guide on how to navigate the scene view : [Video Here](https://youtu.be/5xufxPADb88)


# Creating a Hollow Knight Sprite Object

To add a Hollow Knight Sprite to the scene,
right click anywhere in the hierarchy, and select the "HK Sprite" option.

![Create HK Sprite](https://user-images.githubusercontent.com/12601671/141835434-aa86aee0-675d-43bb-9685-2156538e5f08.PNG)

This will create a new "HK Sprite" GameObject in the scene. If you click on it in the Hiearchy, you will see it's properties in the "Inspector" panel on the right.

![HK Sprite In Inspector](https://user-images.githubusercontent.com/12601671/141835628-becef5ec-7a46-453a-b309-4a36f349cf3d.PNG)

Every object in the game will have a "Transform" component. This component will show you the exact position, rotation, and scale of the object in the scene. This object will also have a "Sprite Renderer" component that is used to make the object visible in the scene.


# Adding in your own sprites

Adding your own sprites to the game is very simple. First, select which folder you want to place your images into in the Project View, and drag and drop your files into it.

![Adding your own sprites to the game](https://user-images.githubusercontent.com/12601671/141835888-917d52b7-ce8a-4ab9-9fe7-1ecd57035da1.gif)

Once the sprites have been added, all you need to to is click on the object you want in the "Hierarchy", and in the "Sprite Renderer" component, change the drag the image into the "Sprite" slot

![Changing an objects sprite](https://user-images.githubusercontent.com/12601671/141836300-b087e805-157f-4eb2-bcce-41888e02e3c9.gif)

# Creating a collidable Hollow Knight Sprite

You can also add HK Sprite Object with collision by again right clicking in the Hierarchy, and selecting the "Ground HK Sprite" option. 

![Create Ground HK Sprite](https://user-images.githubusercontent.com/12601671/141836596-98d15042-3fd5-49d6-8175-08451fa8a766.PNG)

This will also create a new HK Sprite Object, but the different here is that if you were to click on the object in the "Hierarchy", you will notice a new component in the "Inspector" view called "Box Collider 2D"

![Ground HK Sprite Inspector](https://user-images.githubusercontent.com/12601671/141836991-3aac4c09-eaba-4cdf-959e-37bef7894900.PNG)

This component is what gives the Ground HK Sprite it's collision in the game, so the Knight doesn't just fall right through it. You can customize the hitbox of this collider by clicking on the "Edit Collider" button and dragging the green box around the object in the "Scene View"

![Edit Object Collider](https://user-images.githubusercontent.com/12601671/141838545-31c4904b-2f0d-408e-ba76-fb88fca8f5e6.gif)


# Finishing and Exporting the scene

When you are done building the scene, be sure to save the scene so your changes don't get lost

![Save Scene](https://user-images.githubusercontent.com/12601671/141838707-4abbf903-878e-45fb-8b20-bdf6bfc0e809.PNG)

Then, find the scene file in the "Project" window, right click on it, and select the "Export Package" option.

![Export Scene Package](https://user-images.githubusercontent.com/12601671/141838919-b2ffaed5-a22d-4664-b68f-07f343eca360.PNG)

This will open up a window that will allow you to select what objects you want to export. You can just leave everything checked (to minimize breaking) and click on the "Export" button at the bottom-right corner.

This will allow you to export the entire scene as a "unitypackage" file.

![Unity Package Explorer](https://user-images.githubusercontent.com/12601671/141839194-e2999954-b496-4285-bb4f-634074f8a5b9.PNG)

When the exporting process is complete, this "unitypackage" file is what you send to me when you are done. I can then use this file to import it into the final project.