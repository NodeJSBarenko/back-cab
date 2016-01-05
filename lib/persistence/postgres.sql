CREATE SEQUENCE driver_seq;
create table driver (
	driverId int primary key not null default nextval('driver_seq'),
	name varchar not null,
	carPlate char(8) not null,
	latitude double precision,
	longitude double precision,
	driverAvailable boolean default false
);
create index CONCURRENTLY driver_carPlate_idx on driver(carPlate);
create index CONCURRENTLY driver_geolocation_idx on driver(latitude, longitude);
