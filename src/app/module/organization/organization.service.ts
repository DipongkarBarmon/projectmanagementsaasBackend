
import { prisma } from "../../lib/prisma";
import { ICreateOrganization, IOrganizationQuery, IUpdateOrganizationInfo } from "./organization.interface";
import { deleteFromCloudinary, uploadToCloudinary } from "../../lib/cloudinary";
import { OrganizationRole } from "../../../../generated/prisma/enums";
import { OrganizationWhereInput } from "../../../../generated/prisma/models";

const createOrganization = async (payload : ICreateOrganization,fileBuffer : Buffer , userId : string) => {
  const {name,slug,description} = payload
  
  if(!slug){
    throw new Error("Slug is required")
  }
  
  if(!name){
     throw new Error("Name is required")
  }
  
  if(!userId){
    throw new Error("Plaese login to create an organization")
  }
  const user = await prisma.user.findUnique({
    where : {
      id : userId
    }
  })

  if(!user){
    throw new Error("User not found")
  }

  if(user.emailVerified === false){
    throw new Error("Please verify your email before creating an organization")
  }
  
  if(user.status === "BLOCKED"){
    throw new Error("Your account has been blocked. Please contact support.")
  }
  
  if(user.status === "DELETED" || user.isDeleted === true){
    throw new Error("Your account has been deleted. Please contact support.")
  }

  if(user.isActive === false){
    throw new Error("Your account is not active. Please contact support.")
  }

  const isEexistOrganization = await prisma.organization.findFirst({
    where : {
      OR: [
        {name : name},
        {slug:slug}
      ]
    }
  })

  if(isEexistOrganization){
    throw new Error("Organization already exists")
  }

  let cloudinaryResult;
  try {
     cloudinaryResult = await uploadToCloudinary(fileBuffer,'organization-logo')
  } catch (error) {
     throw new Error('Fail to upload logo in cloudinary!')
  }

  if(!cloudinaryResult) {
     throw new Error("Does not upload logo in cloudinary,Please try again")
  }

  const organization = await prisma.organization.create({
     data : {
       name,
       slug,
       description,
       logo : cloudinaryResult.secure_url,
       logoPublicId: cloudinaryResult.public_id
     }
  })

  if(!organization){
    throw new Error("Fail to create organization,Please try again")
  }

  const organizationMember = await prisma.organizationMember.create({
    data :{
       userId,
       organizationId : organization.id,
       organizationRole:OrganizationRole.ORG_ADMIN
    }
  })

  if(!organizationMember){
    throw new Error("Fail to create organization member,Please try again")
  }

  const organizationWithMembers = await prisma.organization.findUnique({
    where : {
      id : organization.id
    },
    include : {
      members : true
    }
  })  

  if(!organizationWithMembers){
    throw new Error("Fail to fetch organization with members,Please try again")
  }

   return {organizationWithMembers}

}


const updateLogo = async(fileBuffer:Buffer,userId : string,organizationId : string)=> {
    const user = await prisma.user.findUnique({
        where : {
            id : userId
        }
    })

    const currentOrganization = await prisma.organization.findUnique({
        where : {
            id : organizationId
        }
    }) 
    if(!currentOrganization){
        throw new Error("Organization not found")
    }

    if(!user){
        throw new Error("User not found")
    }
    if(user.emailVerified === false){
        throw new Error("Please verify your email before updating organization logo")
    }
    if(user.status === "BLOCKED"){
        throw new Error("Your account has been blocked. Please contact support.")
    }

    if(user.status === "DELETED" || user.isDeleted === true){
        throw new Error("Your account has been deleted. Please contact support.")
    }

    if(user.isActive === false){
        throw new Error("Your account is not active. Please contact support.")
    }

    let cloudinaryResult;
    try {
       cloudinaryResult = await uploadToCloudinary(fileBuffer,'organization-logo')
    } catch (error) {
       throw new Error('Fail to upload logo in cloudinary!')
    } 
    
    if(!cloudinaryResult) { 
      throw new Error("Does not upload logo in cloudinary,Please try again")
    }

    const organization = await prisma.organization.update({
        where : {
            id : organizationId
        },
        data : {
            logo : cloudinaryResult.secure_url,
            logoPublicId: cloudinaryResult.public_id
        },
        include : {
            members : true
        }
    })
    if(currentOrganization.logoPublicId && currentOrganization.logo){
        try {
           await deleteFromCloudinary(currentOrganization.logoPublicId)
        } catch (error) {
            console.error("Failed to delete old logo from Cloudinary:", error);
        }
    }

    return {
      data : organization
    }
}



const updateOrganizationInfo = async(payload:IUpdateOrganizationInfo,userId : string,organizationId : string)=>{
   const user = await prisma.user.findUnique({
        where : {
            id : userId
        }
    })

    if(!user){
        throw new Error("User not found")
    }
    if(user.emailVerified === false){
        throw new Error("Please verify your email before updating organization info")
    }
    if(user.status === "BLOCKED"){
        throw new Error("Your account has been blocked. Please contact support.")
    }

    if(user.status === "DELETED" || user.isDeleted === true){
        throw new Error("Your account has been deleted. Please contact support.")
    }

    if(user.isActive === false){
        throw new Error("Your account is not active. Please contact support.")
    }
   const organization = await prisma.organization.update({
        where : {
            id : organizationId
        },
        data : {
            ...payload
        },
        include : {
            members : true
        }
    })
    return {organization}

}



const getOrganizationById = async(organizationId: string)=> {
    const organization = await prisma.organization.findUnique({
        where : {
            id : organizationId
        },
        include : {
            members : true,

        }
    })
    if(!organization){
        throw new Error("Organization not found")
    }
     
    return {
      data: organization
    } 
}
const getAllOrganizations = async(query: IOrganizationQuery)=> {
     // Implement the logic to fetch all organizations with the given query
     const limit = query.limit?Number(query.limit) : 10;
     const page = query.page?Number(query.page): 1;
     const skip = (page -1)*limit;
     const sortBy = query.sortBy? query.sortBy : "createdAt";
     const sortOrder = query.sortOrder? query.sortOrder : "desc";
     
     const addConditions : OrganizationWhereInput[] = []

     if(query.searchTerm){
        addConditions.push({
            OR : [
                {
                    name : {
                        contains : query.searchTerm,
                        mode : "insensitive"
                    }
                },
                {
                    slug : {
                        contains : query.searchTerm,
                        mode : "insensitive"
                    }
                },
                {
                    description : {
                        contains : query.searchTerm,
                        mode : "insensitive"
                    }
                }
            ]
        })
     }

     if(query.name){
        addConditions.push({
            name : query.name
        })
     }

      if(query.slug){
        addConditions.push({
            slug : query.slug
        })
     }

      if(query.description){
        addConditions.push({
            description : query.description
        })
     }    
 
     const organizations = await prisma.organization.findMany({
        where : {
          AND : addConditions
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy] : sortOrder
        }
     })
    
     const totalOrganizations = await prisma.organization.count({
        where : {
          AND : addConditions
        }
     })

     const totalPages = Math.ceil(totalOrganizations/limit)

     return {
        data : organizations,
        meta : {
            page,
            limit,
            total : totalOrganizations,
            totalPages
        }  
     }

}
const deleteOrganization = async(organizationId: string)=> {
    const organization = await prisma.organization.findUnique({
        where : {
            id : organizationId
        }
    })
    if(!organization){
        throw new Error("Organization not found")
    }
    const deletedOrganization =await prisma.organization.delete({
        where : {
            id : organizationId
        }
    })
    return {
         data : deletedOrganization
    }
} 
export const OrganizationService = {
  createOrganization,
  updateLogo,
  updateOrganizationInfo,
  getOrganizationById,
  getAllOrganizations,
  deleteOrganization
}