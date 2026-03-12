export interface IUser {
	id: number
	created_at: string
	name: string
	email: string
	role: 'customer' | 'hotel_owner' | 'admin'
	status: string
	password?: string
}

export interface IHotel {
	id: number
	created_at: string
	name: string
	description: string
	city: string
	address: string
	email: string
	phone: string
	images: string[]
	status: "approved" | "pending" | "rejected" | string
	owner_id: number

	// relationships
	owner?: IUser
}

export interface IRoom {
	id: number
	created_at: string
	hotel_id: number
	owner_id: number
	name: string
	description: string
	type: string
	rent_per_day: number
	status: string
	amenities: string[]
	images: string[]

	// relationships
	hotel?: IHotel
	owner?: IUser
}

export interface IBooking {
	id: number
	created_at: string
	room_id: number
	hotel_id: number
	owner_id: number
	customer_id: number
	hotel_name?: string
	room_name?: string
	customer_name?: string
	booked_dates: string[]
	start_date: string
	end_date: string
	amount: number
	payment_id: string
	status: string

	// relationships
	room?: IRoom
	hotel?: IHotel
	owner?: IUser
	customer?: IUser
}

export interface IStock {
	id: number
	created_at: string
	stockcode: string
	stocktype?: string
	name: string
	description: string
	price: number
	date: string
}

export interface IMonitor {
	id: number
	created_at: string
	stockcode: string	
	price_below: number
	price_top: number
	monitor_type: 'quick' | 'slow'
	status: string
}
